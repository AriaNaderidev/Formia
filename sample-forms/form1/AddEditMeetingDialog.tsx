import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CalendarIcon,
  MapPinIcon,
  BriefcaseIcon,
  ClockIcon,
  DollarSignIcon,
  HashIcon,
  Tag,
  CalendarDaysIcon,
  TimerIcon,
  MessageSquare,
  CheckCircle,
  DollarSign,
  Lightbulb,
  X,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn, normalizeDigits, parseDateValue, toJalaliDate, toLocalDateString } from '@/lib/utils'
import { meetingSchema, defaultMeetingValues, type MeetingFormValues } from '../schema'
import {
  createMeeting as createMeetingThunk,
  fetchNextNumber,
  updateMeeting as updateMeetingThunk,
} from '../store/meeting-slice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { useStaticDataOptions } from '@/hooks/use-static-data'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { TimePicker } from '@/components/ui/timePicker'
import type { CreateMeeting, UpdateMeeting } from '../types'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'

interface AddEditMeetingDialogProps {
  open: boolean
  setOpen: (v: boolean) => void
  meeting?: any
  onSuccess?: () => void
}

// ------------------------------------
// Field components
// ------------------------------------
export function FieldRow({
  icon,
  label,
  htmlFor,
  children,
  error,
  w = 45,
}: {
  icon?: React.ReactNode
  label: string
  htmlFor?: string
  children: React.ReactNode
  error?: string
  w?: number
}) {
  return (
    <Field>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <FieldLabel
          htmlFor={htmlFor}
          className={`min-w-${w} lg:w-45 shrink-0 text-sm flex items-center gap-1`}
        >
          <span className="text-muted-foreground">{icon}</span>
          {label}
        </FieldLabel>

        <div className="flex-1 space-y-1 w-full">
          {children}
          {error && <FieldError className="text-xs text-destructive">{error}</FieldError>}
        </div>
      </div>
    </Field>
  )
}

type FormSectionProps = {
  title: string
  description?: string
  children: React.ReactNode
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="space-y-4 rounded-lg border bg-muted/30 p-4">
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  )
}

// ------------------------------------
// Main Component
// ------------------------------------
export default function AddEditMeetingDialog({
  open,
  setOpen,
  meeting,
  onSuccess,
}: AddEditMeetingDialogProps) {
  const isEdit = !!meeting
  const dispatch = useAppDispatch()

  const nextNumber = useAppSelector(state => state.meetings.nextNumber)

  const [tab, setTab] = useState('general')

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues: defaultMeetingValues,
    mode: 'onChange',
  })

  const { options: typeOptions } = useStaticDataOptions('meeting-type')
  const { options: statusOptions } = useStaticDataOptions('meeting-status')
  const { options: shiftOptions } = useStaticDataOptions('meeting-shift-type')
  const { options: reasonOptions } = useStaticDataOptions('meeting-reason-type')
  const { options: dayOptions } = useStaticDataOptions('week-days')

  function toDateOnly(date: Date | string | undefined) {
    if (!date) return null
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return null
    return toLocalDateString(d)
  }

  useEffect(() => {
    if (open) {
      dispatch(fetchNextNumber())

      if (isEdit && meeting) {
        reset({
          address: meeting.address || '',
          announcementDate: toDateOnly(meeting.announcementDate) || '',
          dayOfWeek: meeting.dayOfWeek || '',
          decisionsDescription: meeting.decisionsDescription || '',
          entryFee:
            meeting.entryFee !== null && meeting.entryFee !== undefined
              ? String(meeting.entryFee)
              : '',
          hasBoardOfDirectors: meeting.hasBoardOfDirectors ?? false,
          hasFinancialReport: meeting.hasFinancialReport ?? false,
          membershipFeeDescription: meeting.membershipFeeDescription || '',
          newspaperPublisher: meeting.newspaperPublisher || '',
          originalityShareholderCount:
            meeting.originalityShareholderCount !== null &&
            meeting.originalityShareholderCount !== undefined
              ? String(meeting.originalityShareholderCount)
              : '',
          powerOfAttorneyShareholderCount:
            meeting.powerOfAttorneyShareholderCount !== null &&
            meeting.powerOfAttorneyShareholderCount !== undefined
              ? String(meeting.powerOfAttorneyShareholderCount)
              : '',
          reasonType: meeting.reasonType || '',
          shiftType: meeting.shiftType || '',
          type: meeting.type || '',
          startDate: toDateOnly(meeting.startDate) || '',
          startTime: meeting.startTime || '',
          totalShareCount:
            meeting.totalShareCount !== null && meeting.totalShareCount !== undefined
              ? String(meeting.totalShareCount)
              : '',
          totalSharePrice:
            meeting.totalSharePrice !== null && meeting.totalSharePrice !== undefined
              ? String(meeting.totalSharePrice)
              : '',
          status: meeting.status || '',
        })
      } else {
        reset(defaultMeetingValues)
      }
    }
  }, [open, isEdit, meeting, reset, dispatch])

  const submit = async (values: MeetingFormValues) => {
    const updatePayload: UpdateMeeting = {
      ...values,

      address: values.address || null,

      announcementDate: toDateOnly(values.announcementDate) || null,

      dayOfWeek: values.dayOfWeek || null,

      decisionsDescription: values.decisionsDescription || null,

      entryFee:
        values.entryFee !== '' && values.entryFee !== null && values.entryFee !== undefined
          ? Number(values.entryFee)
          : null,

      hasBoardOfDirectors: values.hasBoardOfDirectors ?? false,

      hasFinancialReport: values.hasFinancialReport ?? false,

      membershipFeeDescription: values.membershipFeeDescription || null,

      newspaperPublisher: values.newspaperPublisher || null,

      originalityShareholderCount:
        values.originalityShareholderCount !== '' &&
        values.originalityShareholderCount !== null &&
        values.originalityShareholderCount !== undefined
          ? Number(values.originalityShareholderCount)
          : null,

      powerOfAttorneyShareholderCount:
        values.powerOfAttorneyShareholderCount !== '' &&
        values.powerOfAttorneyShareholderCount !== null &&
        values.powerOfAttorneyShareholderCount !== undefined
          ? Number(values.powerOfAttorneyShareholderCount)
          : null,

      reasonType: values.reasonType || null,

      shiftType: values.shiftType || null,

      type: values.type || null,

      startDate: toDateOnly(values.startDate) || null,

      startTime: values.startTime || null,

      totalShareCount:
        values.totalShareCount !== '' &&
        values.totalShareCount !== null &&
        values.totalShareCount !== undefined
          ? Number(values.totalShareCount)
          : null,

      totalSharePrice:
        values.totalSharePrice !== '' &&
        values.totalSharePrice !== null &&
        values.totalSharePrice !== undefined
          ? Number(values.totalSharePrice)
          : null,

      status: values.status || '',
    }

    const createPayload: CreateMeeting = {
      ...values,

      address: values.address || null,

      announcementDate: toDateOnly(values.announcementDate) || null,

      dayOfWeek: values.dayOfWeek || null,

      decisionsDescription: values.decisionsDescription || null,

      entryFee:
        values.entryFee !== '' && values.entryFee !== null && values.entryFee !== undefined
          ? Number(values.entryFee)
          : null,

      hasBoardOfDirectors: values.hasBoardOfDirectors ?? false,

      hasFinancialReport: values.hasFinancialReport ?? false,

      membershipFeeDescription: values.membershipFeeDescription || null,

      newspaperPublisher: values.newspaperPublisher || null,

      originalityShareholderCount:
        values.originalityShareholderCount !== '' &&
        values.originalityShareholderCount !== null &&
        values.originalityShareholderCount !== undefined
          ? Number(values.originalityShareholderCount)
          : null,

      powerOfAttorneyShareholderCount:
        values.powerOfAttorneyShareholderCount !== '' &&
        values.powerOfAttorneyShareholderCount !== null &&
        values.powerOfAttorneyShareholderCount !== undefined
          ? Number(values.powerOfAttorneyShareholderCount)
          : null,

      reasonType: values.reasonType || null,

      shiftType: values.shiftType || null,

      type: values.type || null,

      startDate: toDateOnly(values.startDate) || null,

      startTime: values.startTime || null,

      totalShareCount:
        values.totalShareCount !== '' &&
        values.totalShareCount !== null &&
        values.totalShareCount !== undefined
          ? Number(values.totalShareCount)
          : null,

      totalSharePrice:
        values.totalSharePrice !== '' &&
        values.totalSharePrice !== null &&
        values.totalSharePrice !== undefined
          ? Number(values.totalSharePrice)
          : null,
    }

    try {
      if (isEdit) {
        await dispatch(updateMeetingThunk({ id: meeting.id, data: updatePayload })).unwrap()
      } else {
        await dispatch(createMeetingThunk(createPayload)).unwrap()
      }

      setOpen(false)
      setTimeout(() => {
        toast.success(isEdit ? 'مجمع با موفقیت ویرایش شد' : 'مجمع با موفقیت افزوده شد')
      }, 100)

      onSuccess?.()
    } catch (err: any) {
      if (err?.fields) {
        err.fields.forEach((f: any) => {
          const key = f.key.replace('$.', '') as keyof MeetingFormValues
          setError(key, { message: f.messages?.[0] ?? 'خطا' })
        })
        return
      }
      toast.error('خطا در ارتباط با سرور')
    }
  }

  const onError = (errors: unknown) => {
    if (errors) setTab('general')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[95vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? 'ویرایش مجمع' : 'افزودن مجمع جدید'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit, onError)} className="space-y-6">
          <Tabs value={tab} onValueChange={setTab} className="w-full space-y-4">
            <TabsList className="flex w-full justify-start overflow-x-auto">
              <TabsTrigger value="general" className="cursor-pointer">
                اطلاعات کلی
              </TabsTrigger>
              <TabsTrigger value="others" className="cursor-pointer">
                سایر اطلاعات
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card className="p-4 bg-white">
                <div className="grid grid-cols-1 gap-6">
                  {/* SECTION 1 — اطلاعات کلی */}
                  <FormSection title="اطلاعات کلی مجمع">
                    <FieldRow icon={<Tag className="w-7 h-5 text-sm" />} label="شماره مجمع">
                      <Input
                        className="w-32 text-center"
                        disabled
                        value={isEdit ? meeting.number : (nextNumber ?? '')}
                      />
                    </FieldRow>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FieldRow
                        icon={<BriefcaseIcon className="w-7 h-5 text-sm" />}
                        label="عنوان"
                        error={errors.reasonType?.message}
                        w={18}
                      >
                        <Controller
                          control={control}
                          name="reasonType"
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="w-45">
                                <SelectValue placeholder="انتخاب عنوان" />
                              </SelectTrigger>
                              <SelectContent>
                                {reasonOptions.map(opt => (
                                  <SelectItem key={opt.key} value={opt.key}>
                                    {opt.value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </FieldRow>

                      <FieldRow
                        icon={<MessageSquare className="w-7 h-5 text-sm" />}
                        label="نوع مجمع"
                        error={errors.type?.message}
                        w={22}
                      >
                        <Controller
                          control={control}
                          name="type"
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="w-45">
                                <SelectValue placeholder="انتخاب نوع" />
                              </SelectTrigger>
                              <SelectContent>
                                {typeOptions.map(opt => (
                                  <SelectItem key={opt.key} value={opt.key}>
                                    {opt.value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </FieldRow>

                      <FieldRow
                        icon={<DollarSign className="w-7 h-5 text-sm" />}
                        label="حق ورودی سالانه"
                        error={errors.entryFee?.message}
                        w={30}
                      >
                        <Controller
                          control={control}
                          name="entryFee"
                          render={({ field }) => <Input {...field} className="w-45" />}
                        />
                      </FieldRow>
                      {isEdit && (
                        <FieldRow
                          icon={<Lightbulb className="w-7 h-5 text-sm" />}
                          label="وضعیت"
                          error={errors.status?.message}
                        >
                          <Controller
                            control={control}
                            name="status"
                            render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="انتخاب وضعیت" />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusOptions.map(opt => (
                                    <SelectItem key={opt.key} value={opt.key}>
                                      {opt.value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </FieldRow>
                      )}
                    </div>
                  </FormSection>

                  {/* SECTION 2 — زمان‌بندی */}
                  <FormSection title="زمان‌بندی">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FieldRow
                        icon={<CalendarDaysIcon className="w-7 h-5 text-sm" />}
                        label="روز"
                        error={errors.dayOfWeek?.message}
                        w={18}
                      >
                        <Controller
                          control={control}
                          name="dayOfWeek"
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="انتخاب روز" />
                              </SelectTrigger>
                              <SelectContent>
                                {dayOptions.map(opt => (
                                  <SelectItem key={opt.key} value={opt.key}>
                                    {opt.value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </FieldRow>

                      <FieldRow
                        icon={<ClockIcon className="w-7 h-5 text-sm" />}
                        label="نوبت"
                        error={errors.shiftType?.message}
                        w={18}
                      >
                        <Controller
                          control={control}
                          name="shiftType"
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="انتخاب نوبت" />
                              </SelectTrigger>
                              <SelectContent>
                                {shiftOptions.map(opt => (
                                  <SelectItem key={opt.key} value={opt.key}>
                                    {opt.value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </FieldRow>

                      {/* تاریخ شروع */}
                      <FieldRow
                        icon={<CalendarIcon className="w-7 h-5 text-sm" />}
                        label="تاریخ شروع"
                        error={errors.startDate?.message}
                        w={25}
                      >
                        <Controller
                          control={control}
                          name="startDate"
                          render={({ field }) => {
                            const display = field.value ? toJalaliDate(field.value) : 'انتخاب تاریخ'
                            return (
                              <Popover>
                                <div className="flex justify-center relative">
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        'justify-start w-full',
                                        !field.value && 'text-muted-foreground'
                                      )}
                                    >
                                      {display}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      fromYear={1400}
                                      toYear={1420}
                                      captionLayout="dropdown"
                                      mode="single"
                                      selected={
                                        field.value ? parseDateValue(field.value) : undefined
                                      }
                                      onSelect={date =>
                                        field.onChange(date ? toLocalDateString(date) : '')
                                      }
                                    />
                                  </PopoverContent>
                                  {field.value && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      className="text-destructive hover:bg-transparent absolute left-0"
                                      onClick={() => field.onChange('')}
                                    >
                                      <X />
                                    </Button>
                                  )}
                                </div>
                              </Popover>
                            )
                          }}
                        />
                      </FieldRow>

                      {/* ساعت شروع */}
                      <FieldRow
                        icon={<TimerIcon className="w-7 h-5 text-sm" />}
                        label="ساعت شروع"
                        error={errors.startTime?.message}
                        w={27}
                      >
                        <Controller
                          control={control}
                          name="startTime"
                          render={({ field }) => <TimePicker {...field} />}
                        />
                      </FieldRow>
                    </div>
                  </FormSection>

                  {/* SECTION 3 — اطلاعات سهام */}
                  <FormSection title="اطلاعات سهام">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FieldRow
                        icon={<HashIcon className="w-7 h-5 text-sm" />}
                        label="تعداد کل سهام"
                        error={errors.totalShareCount?.message}
                      >
                        <Controller
                          control={control}
                          name="totalShareCount"
                          render={({ field }) => (
                            <Input
                              inputMode="numeric"
                              value={field.value}
                              onChange={e => {
                                const v = normalizeDigits(e.target.value)
                                field.onChange(v.replace(/\D/g, ''))
                              }}
                            />
                          )}
                        />
                      </FieldRow>

                      <FieldRow
                        icon={<DollarSignIcon className="w-7 h-5 text-sm" />}
                        label="قیمت کل سهام"
                        error={errors.totalSharePrice?.message}
                      >
                        <Controller
                          control={control}
                          name="totalSharePrice"
                          render={({ field }) => (
                            <Input
                              inputMode="numeric"
                              value={field.value}
                              onChange={e => {
                                const v = normalizeDigits(e.target.value)
                                field.onChange(v.replace(/\D/g, ''))
                              }}
                            />
                          )}
                        />
                      </FieldRow>
                    </div>
                  </FormSection>

                  {/* SECTION 4 — آدرس */}
                  <FormSection title="آدرس محل برگزاری">
                    <FieldRow
                      icon={<MapPinIcon className="w-7 h-5 text-sm" />}
                      label="آدرس"
                      error={errors.address?.message}
                      w={20}
                    >
                      <Controller
                        control={control}
                        name="address"
                        render={({ field }) => (
                          <Textarea rows={3} {...field} className="max-w-120" />
                        )}
                      />
                    </FieldRow>
                  </FormSection>

                  {/* FOOTER */}
                  <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                      disabled={isSubmitting}
                    >
                      انصراف
                    </Button>
                    <Button type="button" onClick={() => setTab('others')}>
                      صفحه بعد
                    </Button>
                  </DialogFooter>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="others">
              <Card className="p-4 bg-white">
                <div className="grid grid-cols-1 gap-6">
                  {/* SECTION 5 — گزارش‌ها */}
                  <FormSection title="گزارش‌ها و مصوبات">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FieldRow
                        icon={<CheckCircle className="w-7 h-5 text-sm" />}
                        label="گزارش عملکرد هیات مدیره"
                      >
                        <Controller
                          control={control}
                          name="hasBoardOfDirectors"
                          render={({ field }) => (
                            <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                          )}
                        />
                      </FieldRow>

                      <FieldRow
                        icon={<CheckCircle className="w-7 h-5 text-sm" />}
                        label="صورت‌های مالی"
                        w={35}
                      >
                        <Controller
                          control={control}
                          name="hasFinancialReport"
                          render={({ field }) => (
                            <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                          )}
                        />
                      </FieldRow>
                    </div>
                  </FormSection>

                  {/* SECTION 6 — توضیحات */}
                  <FormSection title="توضیحات تکمیلی">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <FieldRow
                        icon={<MapPinIcon className="w-7 h-5 text-sm" />}
                        label="توضیحات حق عضویت"
                      >
                        <Controller
                          control={control}
                          name="membershipFeeDescription"
                          render={({ field }) => (
                            <Textarea rows={3} {...field} className="md:w-80 lg:w-50" />
                          )}
                        />
                      </FieldRow>

                      <FieldRow
                        icon={<MapPinIcon className="w-7 h-5 text-sm" />}
                        label="توضیحات تصمیمات"
                      >
                        <Controller
                          control={control}
                          name="decisionsDescription"
                          render={({ field }) => (
                            <Textarea rows={3} {...field} className="md:w-80 lg:w-50" />
                          )}
                        />
                      </FieldRow>
                    </div>
                  </FormSection>

                  {/* SECTION 7 — شرکت‌کنندگان */}
                  <FormSection title="شرکت‌کنندگان مجمع">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FieldRow
                        icon={<HashIcon className="w-7 h-5 text-sm" />}
                        label="تعداد شرکت‌کنندگان اصالتاً"
                      >
                        <Controller
                          control={control}
                          name="originalityShareholderCount"
                          render={({ field }) => (
                            <Input
                              inputMode="numeric"
                              value={field.value}
                              onChange={e => {
                                const v = normalizeDigits(e.target.value)
                                field.onChange(v.replace(/\D/g, ''))
                              }}
                            />
                          )}
                        />
                      </FieldRow>

                      <FieldRow
                        icon={<HashIcon className="w-7 h-5 text-sm" />}
                        label="تعداد شرکت‌کنندگان وکالتاً"
                      >
                        <Controller
                          control={control}
                          name="powerOfAttorneyShareholderCount"
                          render={({ field }) => (
                            <Input
                              inputMode="numeric"
                              value={field.value}
                              onChange={e => {
                                const v = normalizeDigits(e.target.value)
                                field.onChange(v.replace(/\D/g, ''))
                              }}
                            />
                          )}
                        />
                      </FieldRow>
                    </div>
                  </FormSection>

                  {/* SECTION 8 — آگهی و روزنامه */}
                  <FormSection title="انتشار و آگهی">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FieldRow
                        icon={<CalendarIcon className="w-7 h-5 text-sm" />}
                        label="تاریخ آگهی"
                        w={25}
                      >
                        <Controller
                          control={control}
                          name="announcementDate"
                          render={({ field }) => {
                            const display = field.value ? toJalaliDate(field.value) : 'انتخاب تاریخ'
                            return (
                              <Popover>
                                <div className="flex justify-center relative">
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" className="justify-start w-full">
                                      {display}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      fromYear={1400}
                                      toYear={1420}
                                      captionLayout="dropdown"
                                      mode="single"
                                      selected={
                                        field.value ? parseDateValue(field.value) : undefined
                                      }
                                      onSelect={date =>
                                        field.onChange(date ? toLocalDateString(date) : '')
                                      }
                                    />
                                  </PopoverContent>
                                  {field.value && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      className="text-destructive hover:bg-transparent absolute left-0"
                                      onClick={() => field.onChange('')}
                                    >
                                      <X />
                                    </Button>
                                  )}
                                </div>
                              </Popover>
                            )
                          }}
                        />
                      </FieldRow>

                      <FieldRow
                        icon={<MapPinIcon className="w-7 h-5 text-sm" />}
                        label="ناشر روزنامه"
                        w={25}
                      >
                        <Controller
                          control={control}
                          name="newspaperPublisher"
                          render={({ field }) => <Input {...field} />}
                        />
                      </FieldRow>
                    </div>
                  </FormSection>

                  {/* FOOTER */}
                  <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                      disabled={isSubmitting}
                    >
                      انصراف
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'در حال ذخیره...' : isEdit ? 'ذخیره' : 'افزودن'}
                    </Button>
                  </DialogFooter>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  )
}
