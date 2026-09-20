/**
 * Minimal in-memory DynamoDB DocumentClient for tests when
 * DYNAMODB_ENDPOINT=memory. Supports Get/Put/Update/Delete/Query/Scan
 * enough for PK/SK + GSI1 + GSI2 access patterns used by this app.
 */

type Item = Record<string, unknown>;

type Key = { PK: string; SK: string };

function itemKey(pk: string, sk: string): string {
  return `${pk}\0${sk}`;
}

function resolveName(
  token: string,
  names: Record<string, string> | undefined,
): string {
  if (token.startsWith('#')) {
    return names?.[token.slice(1)] || names?.[token] || token.slice(1);
  }
  return token;
}

function parseKeyCondition(
  expression: string | undefined,
  names: Record<string, string> | undefined,
  values: Record<string, unknown> | undefined,
): {
  pkAttr: string;
  pkValue: unknown;
  skAttr?: string;
  skOp?: 'eq' | 'begins_with';
  skValue?: unknown;
} {
  if (!expression || !values) {
    throw new Error('KeyConditionExpression required');
  }

  const begins = expression.match(
    /(\S+)\s*=\s*(:\w+)\s+AND\s+begins_with\(\s*(\S+)\s*,\s*(:\w+)\s*\)/i,
  );
  if (begins) {
    return {
      pkAttr: resolveName(begins[1], names),
      pkValue: values[begins[2]],
      skAttr: resolveName(begins[3], names),
      skOp: 'begins_with',
      skValue: values[begins[4]],
    };
  }

  const eqBoth = expression.match(
    /(\S+)\s*=\s*(:\w+)\s+AND\s+(\S+)\s*=\s*(:\w+)/i,
  );
  if (eqBoth) {
    return {
      pkAttr: resolveName(eqBoth[1], names),
      pkValue: values[eqBoth[2]],
      skAttr: resolveName(eqBoth[3], names),
      skOp: 'eq',
      skValue: values[eqBoth[4]],
    };
  }

  const eqPk = expression.match(/(\S+)\s*=\s*(:\w+)/i);
  if (eqPk) {
    return {
      pkAttr: resolveName(eqPk[1], names),
      pkValue: values[eqPk[2]],
    };
  }

  throw new Error(`Unsupported KeyConditionExpression: ${expression}`);
}

function applyUpdate(
  item: Item,
  updateExpression: string,
  names: Record<string, string> | undefined,
  values: Record<string, unknown> | undefined,
): Item {
  const next = { ...item };
  const resolve = (token: string) => resolveName(token, names);

  const setMatch = updateExpression.match(/SET\s+(.+?)(?:\s+REMOVE\s+|$)/i);
  if (setMatch && values) {
    const assignments = setMatch[1].split(',').map((s) => s.trim());
    for (const assignment of assignments) {
      const m = assignment.match(/(\S+)\s*=\s*(:\w+)/);
      if (!m) continue;
      next[resolve(m[1])] = values[m[2]];
    }
  }

  const removeMatch = updateExpression.match(/REMOVE\s+(.+)$/i);
  if (removeMatch) {
    const attrs = removeMatch[1].split(',').map((s) => s.trim());
    for (const token of attrs) {
      delete next[resolve(token)];
    }
  }

  return next;
}

function evalSimplePredicate(
  item: Item,
  predicate: string,
  names: Record<string, string> | undefined,
  values: Record<string, unknown> | undefined,
): boolean {
  const p = predicate.trim();

  if (/^attribute_not_exists\s*\(\s*(\S+)\s*\)$/i.test(p)) {
    const m = p.match(/^attribute_not_exists\s*\(\s*(\S+)\s*\)$/i)!;
    const attr = resolveName(m[1], names);
    return item[attr] === undefined;
  }

  const begins = p.match(/^begins_with\s*\(\s*(\S+)\s*,\s*(:\w+)\s*\)$/i);
  if (begins && values) {
    const attr = resolveName(begins[1], names);
    const prefix = String(values[begins[2]] ?? '');
    return String(item[attr] ?? '').startsWith(prefix);
  }

  const eq = p.match(/^(\S+)\s*=\s*(:\w+)$/i);
  if (eq && values) {
    const attr = resolveName(eq[1], names);
    return item[attr] === values[eq[2]];
  }

  return true;
}

/** Evaluate FilterExpression with AND / OR / parentheses (demo-scale). */
function matchesFilter(
  item: Item,
  filter: string | undefined,
  names: Record<string, string> | undefined,
  values: Record<string, unknown> | undefined,
): boolean {
  if (!filter) return true;

  const evalExpr = (expr: string): boolean => {
    let s = expr.trim();
    if (s.startsWith('(') && s.endsWith(')')) {
      // strip outer parens if balanced
      let depth = 0;
      let balanced = true;
      for (let i = 0; i < s.length; i++) {
        if (s[i] === '(') depth++;
        if (s[i] === ')') depth--;
        if (depth === 0 && i < s.length - 1) {
          balanced = false;
          break;
        }
      }
      if (balanced) s = s.slice(1, -1).trim();
    }

    // split by OR at depth 0
    {
      const parts: string[] = [];
      let depth = 0;
      let buf = '';
      const tokens = s.split(/(\s+OR\s+)/i);
      for (const t of tokens) {
        if (/^\s+OR\s+$/i.test(t) && depth === 0) {
          parts.push(buf);
          buf = '';
        } else {
          for (const ch of t) {
            if (ch === '(') depth++;
            if (ch === ')') depth--;
          }
          buf += t;
        }
      }
      if (parts.length) {
        parts.push(buf);
        return parts.some((part) => evalExpr(part));
      }
    }

    // split by AND at depth 0
    {
      const parts: string[] = [];
      let depth = 0;
      let buf = '';
      const tokens = s.split(/(\s+AND\s+)/i);
      for (const t of tokens) {
        if (/^\s+AND\s+$/i.test(t) && depth === 0) {
          parts.push(buf);
          buf = '';
        } else {
          for (const ch of t) {
            if (ch === '(') depth++;
            if (ch === ')') depth--;
          }
          buf += t;
        }
      }
      if (parts.length) {
        parts.push(buf);
        return parts.every((part) => evalExpr(part));
      }
    }

    return evalSimplePredicate(item, s, names, values);
  };

  return evalExpr(filter);
}

export function createMemoryDocClient() {
  const store = new Map<string, Item>();

  const allItems = () => [...store.values()];

  const send = async (command: {
    name?: string;
    input?: Record<string, unknown>;
    constructor?: { name: string };
  }) => {
    const name =
      command.constructor?.name ||
      (command as { name?: string }).name ||
      '';
    const input =
      (command as { input?: Record<string, unknown> }).input ||
      (command as unknown as Record<string, unknown>);

    if (name === 'GetCommand' || (name.includes('Get') && !name.includes('Target'))) {
      const key = input.Key as Key;
      const item = store.get(itemKey(key.PK, key.SK));
      return { Item: item ? { ...item } : undefined };
    }

    if (name === 'PutCommand' || name.includes('Put')) {
      const item = input.Item as Item;
      const pk = String(item.PK);
      const sk = String(item.SK);
      const condition = input.ConditionExpression as string | undefined;
      if (
        condition &&
        /attribute_not_exists\s*\(\s*PK\s*\)/i.test(condition)
      ) {
        if (store.has(itemKey(pk, sk))) {
          const err = new Error(
            'ConditionalCheckFailedException',
          ) as Error & { name: string };
          err.name = 'ConditionalCheckFailedException';
          throw err;
        }
      }
      store.set(itemKey(pk, sk), { ...item });
      return {};
    }

    if (name === 'DeleteCommand' || name.includes('Delete')) {
      const key = input.Key as Key;
      store.delete(itemKey(key.PK, key.SK));
      return {};
    }

    if (name === 'UpdateCommand' || name.includes('Update')) {
      const key = input.Key as Key;
      const existing = store.get(itemKey(key.PK, key.SK));
      if (!existing) {
        return { Attributes: undefined };
      }
      const updated = applyUpdate(
        existing,
        String(input.UpdateExpression || ''),
        input.ExpressionAttributeNames as Record<string, string> | undefined,
        input.ExpressionAttributeValues as Record<string, unknown> | undefined,
      );
      store.set(itemKey(key.PK, key.SK), updated);
      return { Attributes: { ...updated } };
    }

    if (name === 'QueryCommand' || name.includes('Query')) {
      const parsed = parseKeyCondition(
        input.KeyConditionExpression as string | undefined,
        input.ExpressionAttributeNames as Record<string, string> | undefined,
        input.ExpressionAttributeValues as Record<string, unknown> | undefined,
      );

      let items = allItems().filter(
        (item) => item[parsed.pkAttr] === parsed.pkValue,
      );

      if (parsed.skAttr && parsed.skOp === 'eq') {
        items = items.filter(
          (item) => item[parsed.skAttr!] === parsed.skValue,
        );
      } else if (parsed.skAttr && parsed.skOp === 'begins_with') {
        const prefix = String(parsed.skValue ?? '');
        items = items.filter((item) =>
          String(item[parsed.skAttr!] ?? '').startsWith(prefix),
        );
      }

      items = items.filter((item) =>
        matchesFilter(
          item,
          input.FilterExpression as string | undefined,
          input.ExpressionAttributeNames as Record<string, string> | undefined,
          input.ExpressionAttributeValues as Record<string, unknown> | undefined,
        ),
      );

      const skSortAttr = parsed.skAttr || 'SK';
      const forward = input.ScanIndexForward !== false;
      items.sort((a, b) => {
        const av = String(a[skSortAttr] ?? '');
        const bv = String(b[skSortAttr] ?? '');
        return forward ? av.localeCompare(bv) : bv.localeCompare(av);
      });

      const limit = input.Limit as number | undefined;
      if (limit != null) {
        items = items.slice(0, limit);
      }

      return { Items: items.map((i) => ({ ...i })) };
    }

    if (name === 'ScanCommand' || name.includes('Scan')) {
      let items = allItems();
      items = items.filter((item) =>
        matchesFilter(
          item,
          input.FilterExpression as string | undefined,
          input.ExpressionAttributeNames as Record<string, string> | undefined,
          input.ExpressionAttributeValues as Record<string, unknown> | undefined,
        ),
      );
      return { Items: items.map((i) => ({ ...i })), Count: items.length };
    }

    throw new Error(`memory DocClient: unsupported command ${name}`);
  };

  return {
    send,
    _clear() {
      store.clear();
    },
    _store: store,
  };
}

export type MemoryDocClient = ReturnType<typeof createMemoryDocClient>;
