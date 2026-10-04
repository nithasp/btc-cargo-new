import { config } from '../config';
import { withTransaction } from '../database';
import { NewNotification } from '../types/notification.types';
import { VerificationServiceDeps } from '../types/service.types';
import { Upload } from '../types/upload.types';
import {
  CreatedVerification,
  VerificationImage,
  VerificationKind,
  VerificationState,
} from '../types/verification.types';
import { AppError } from '../utils/errors';
import { toUploadView } from './upload.service';

const APPROVED: Record<VerificationKind, NewNotification> = {
  partner: {
    title: 'ยืนยันตัวตนสำเร็จ',
    message: 'เจ้าหน้าที่ตรวจสอบข้อมูลของคุณแล้ว สามารถใช้บริการโอน/แลก/จ่ายเงินหยวนได้',
    link: '/web/create-exchange',
    linkText: 'สร้างรายการแลกเงิน',
  },
  affiliate: {
    title: 'ยืนยันตัวตนตัวแทนสำเร็จ',
    message: 'เจ้าหน้าที่ตรวจสอบข้อมูลของคุณแล้ว สามารถจัดการตัวแทนได้',
    link: '/web/agent',
    linkText: 'สร้าง/แก้ไขตัวแทน',
  },
};

export function createVerificationService({
  verifications,
  uploads,
  users,
  notifications,
}: VerificationServiceDeps) {
  const autoApproveMs = config.demo.autoApproveSeconds * 1000;

  // There is no back office in this project, so a request left in review is approved once it is
  // older than DEMO_AUTO_APPROVE_SECONDS. Set that to 0 to keep requests in review.
  async function state(userId: number, kind: VerificationKind): Promise<VerificationState> {
    const latest = await verifications.latest(userId, kind);
    if (!latest || latest.state === 'rejected') return 'unverified';
    if (latest.state === 'verified') return 'verified';

    if (autoApproveMs > 0 && Date.now() - latest.createdAt.getTime() >= autoApproveMs) {
      if (await verifications.approve(latest.id)) notifications.notifyQuietly(userId, APPROVED[kind]);
      return 'verified';
    }
    return 'reviewing';
  }

  return {
    state,

    async requireVerified(userId: number, kind: VerificationKind): Promise<void> {
      if ((await state(userId, kind)) !== 'verified') {
        throw new AppError('Identity verification is required for this service.', 403, 'forbidden');
      }
    },

    async submit(
      userId: number,
      kind: VerificationKind,
      images: { url: string; category: string }[],
    ): Promise<CreatedVerification> {
      if ((await state(userId, kind)) !== 'unverified') {
        throw new AppError('A verification request has already been submitted.', 409, 'conflict');
      }

      const owned: { upload: Upload; category: string }[] = [];
      for (const image of images) {
        owned.push({ upload: await uploads.resolveOwned(userId, image.url), category: image.category });
      }

      const created = await withTransaction(async (tx) => {
        const verification = await verifications.create(userId, kind, tx);
        const stored: VerificationImage[] = [];
        for (const { upload, category } of owned) {
          const id = await verifications.addImage(verification.id, upload.id, category, tx);
          stored.push({ id, url: toUploadView(upload).url, image_category: category });
        }
        return { id: verification.id, images: stored };
      });

      return {
        id: created.id,
        state: 'reviewing',
        partner: { id: userId, name: await users.displayName(userId) },
        images: created.images,
      };
    },
  };
}

export type VerificationService = ReturnType<typeof createVerificationService>;
