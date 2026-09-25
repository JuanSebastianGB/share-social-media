import request from 'supertest';
import {
  createFileUploadedRegisterService,
  getFileService,
} from '../services/storage.js';
import { app } from './testApp.js';
import { authHeader, registerUser } from './helpers.js';

describe('Storage owner characterization', () => {
  test('persists userId and only the owner can soft-delete', async () => {
    const owner = await registerUser();
    const other = await registerUser({ firstName: 'Other' });

    const created = await createFileUploadedRegisterService(
      'photo.png',
      'https://media.local/photo.png',
      owner.userId,
    );

    const stored = await getFileService(created._id);
    expect(stored?.userId).toBe(owner.userId);

    const denied = await request(app)
      .delete(`/storage/${created._id}`)
      .set(authHeader(other.token));

    expect(denied.status).toBe(403);
    expect(denied.body).toBe('ERROR_NOT_RESOURCE_OWNER');
    expect(await getFileService(created._id)).not.toBeNull();

    const allowed = await request(app)
      .delete(`/storage/${created._id}`)
      .set(authHeader(owner.token));

    expect(allowed.status).toBe(200);
    expect(allowed.body).toEqual(
      expect.objectContaining({ deletedCount: 1 }),
    );
    expect(await getFileService(created._id)).toBeNull();
  });

  test('ownerless file stays when an authenticated user soft-deletes it', async () => {
    const owner = await registerUser();
    const created = await createFileUploadedRegisterService(
      'photo.png',
      'https://media.local/photo.png',
    );

    const response = await request(app)
      .delete(`/storage/${created._id}`)
      .set(authHeader(owner.token));

    expect(response.status).toBe(403);
    expect(response.body).toBe('ERROR_NOT_RESOURCE_OWNER');
    expect(await getFileService(created._id)).not.toBeNull();
  });
});
