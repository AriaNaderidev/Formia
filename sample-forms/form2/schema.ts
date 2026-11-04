// schema.ts
import { z } from 'zod'

// Iranian mobile: 10 digits, must start with 9, no leading zero
const IRAN_MOBILE_REGEX = /^9\d{9}$/

// Iranian national ID (کد ملی) checksum validator
function isValidIranianNationalId(value: string): boolean {
  if (!/^\d{10}$/.test(value)) return false
  if (/^(\d)\1{9}$/.test(value)) return false // all same digit -> invalid

  const digits = value.split('').map(Number)
  const check = digits[9]
  const sum = digits.slice(0, 9).reduce((acc, digit, index) => acc + digit * (10 - index), 0)
  const remainder = sum % 11

  return remainder < 2 ? check === remainder : check === 11 - remainder
}

const baseUserSchema = z.object({
  fullName: z
    .string()
    .min(1, 'نام و نام خانوادگی الزامی است')
    .max(200, 'نام کامل نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد'),

  email: z
    .string()
    .max(150, 'ایمیل نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد')
    .email('ایمیل معتبر نیست')
    .optional()
    .or(z.literal('')),

  description: z
    .string()
    .max(1000, 'توضیحات نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد')
    .optional()
    .or(z.literal('')),

  mobile: z
    .string()
    .min(1, 'شماره موبایل الزامی است')
    .regex(IRAN_MOBILE_REGEX, 'شماره موبایل معتبر نیست'),

  uniqueIdentifier: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(val => !val || isValidIranianNationalId(val), {
      message: 'کد ملی معتبر نیست',
    }),

  menuIds: z.array(z.number()).min(1, 'حداقل یک دسترسی باید انتخاب شود'),

  // Only relevant on create
  password: z.string().max(256, 'رمز عبور نمی‌تواند بیشتر از ۲۵۶ کاراکتر باشد').optional(),
  confirmPassword: z.string().optional(),

  // Only relevant on edit
  status: z.string().optional(),
})

// Schema factory: password/confirmPassword required only when creating.
export const getUserSchema = (isEdit: boolean) =>
  baseUserSchema.superRefine((values, ctx) => {
    if (!isEdit) {
      if (!values.password || values.password.length < 8) {
        ctx.addIssue({
          path: ['password'],
          code: z.ZodIssueCode.custom,
          message: 'رمز عبور الزامی است و باید حداقل ۸ کاراکتر باشد',
        })
      }
      if (values.password !== values.confirmPassword) {
        ctx.addIssue({
          path: ['confirmPassword'],
          code: z.ZodIssueCode.custom,
          message: 'تکرار رمز عبور مطابقت ندارد',
        })
      }
    }
  })

export type UserFormValues = z.infer<typeof baseUserSchema>

export const defaultUserValues: UserFormValues = {
  fullName: '',
  email: '',
  description: '',
  mobile: '',
  uniqueIdentifier: '',
  menuIds: [] as number[],
  password: '',
  confirmPassword: '',
  status: '',
}
