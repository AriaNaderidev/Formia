// schema.ts
import { z } from 'zod'

export const meetingSchema = z.object({
  address: z.string().max(2048, 'آدرس نمی‌تواند بیشتر از ۲۰۴۸ کاراکتر باشد').optional(),
  dayOfWeek: z.string().min(1, 'روز الزامی است'),
  reasonType: z.string().min(1, 'عنوان الزامی است'),
  shiftType: z.string().min(1, 'نوبت الزامی است'),
  type: z.string().min(1, 'نوع الزامی است'),
  startDate: z.string().min(1, 'تاریخ شروع الزامی است'),
  startTime: z.string().min(1, 'ساعت شروع الزامی است'),
  totalShareCount: z.string().min(1, 'تعداد کل سهام الزامی است'),
  totalSharePrice: z.string().min(1, 'قیمت کل سهام الزامی است'),
  announcementDate: z.string().optional(),
  decisionsDescription: z
    .string()
    .max(2048, 'توضیحات نمی‌تواند بیشتر از ۲۰۴۸ کاراکتر باشد')
    .optional(),
  entryFee: z.string().optional(),
  hasBoardOfDirectors: z.boolean().optional(),
  hasFinancialReport: z.boolean().optional(),
  membershipFeeDescription: z
    .string()
    .max(2048, 'توضیحات نمی‌تواند بیشتر از ۲۰۴۸ کاراکتر باشد')
    .optional(),
  newspaperPublisher: z
    .string()
    .max(300, 'ناشر روزنامه نمی‌تواند بیشتر از ۳۰۰ کاراکتر باشد')
    .optional(),
  originalityShareholderCount: z.string().optional(),
  powerOfAttorneyShareholderCount: z.string().optional(),
  status: z.string().optional(),
})

export type MeetingFormValues = z.infer<typeof meetingSchema>

export const defaultMeetingValues: MeetingFormValues = {
  address: '',
  announcementDate: '',
  dayOfWeek: '',
  decisionsDescription: '',
  entryFee: '',
  hasBoardOfDirectors: false,
  hasFinancialReport: false,
  membershipFeeDescription: '',
  newspaperPublisher: '',
  originalityShareholderCount: '',
  powerOfAttorneyShareholderCount: '',
  shiftType: '',
  reasonType: '',
  type: '',
  startDate: '',
  startTime: '',
  totalShareCount: '',
  totalSharePrice: '',
  status: '',
}
