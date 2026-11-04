import { useEffect, useMemo, useState } from 'react'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getUserSchema, defaultUserValues, type UserFormValues } from '../schema'

import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  FileTextIcon,
  IdCardIcon,
  ShieldCheckIcon,
  KeyIcon,
  LockIcon,
  Loader2Icon,
  ChevronsUpDown,
  EyeOff,
  Eye,
  X,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'

import { useAppDispatch } from '@/store/hooks'
import { useStaticDataOptions } from '@/hooks/use-static-data'
import { cn, normalizeDigits } from '@/lib/utils'

import {
  createUser as createUserThunk,
  updateUser as updateUserThunk,
} from '../store/users-management-slice'
import type { CreateUser, UpdateUser, User } from '../types'
import { useMenus, type MenuTreeNode } from '../hooks/use-menus'
import { collectIds, flattenTree } from '../utils/helper'

interface AddEditUserDialogProps {
  open: boolean
  setOpen: (v: boolean) => void
  user?: User
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
          className={`min-w-${w} lg:w-40 shrink-0 text-sm flex items-center gap-1`}
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
// Main dialog component
// ------------------------------------
export default function AddEditUserDialog({
  open,
  setOpen,
  user,
  onSuccess,
}: AddEditUserDialogProps) {
  const isEdit = !!user
  const dispatch = useAppDispatch()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const schema = useMemo(() => getUserSchema(isEdit), [isEdit])

  const { options: userStatusOptions } = useStaticDataOptions('user-status')
  const {
    menuTree,
    loading: menusLoading,
    error: menusError,
    refetch: refetchMenus,
  } = useMenus(open)

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultUserValues,
    mode: 'onChange',
  })

  useEffect(() => {
    if (!open) return

    if (isEdit && user) {
      reset({
        fullName: user.fullName || '',
        email: user.email || '',
        description: user.description || '',
        mobile: user.mobile != null ? String(user.mobile) : '',
        uniqueIdentifier: user.uniqueIdentifier || '',
        menuIds: (user.menus || []).map((m: any) => Number(m.id)),
        password: '',
        confirmPassword: '',
        status: user.status || '',
      })
    } else {
      reset(defaultUserValues)
    }
  }, [open, isEdit, user, reset])

  const handleMobileChange = (value: string, onChange: (v: string) => void) => {
    let digits = normalizeDigits(value).replace(/\D/g, '')
    // strip a leading zero the user might type (e.g. pasting 0912...)
    if (digits.startsWith('0')) digits = digits.slice(1)
    onChange(digits)
  }

  const submit = async (values: UserFormValues) => {
    try {
      if (isEdit) {
        const payload: UpdateUser = {
          description: values.description || null,
          email: values.email || null,
          fullName: values.fullName || null,
          menuIds: values.menuIds.map(String),
          mobile: values.mobile || null,
          status: values.status || null,
        }
        await dispatch(updateUserThunk({ id: user.id, data: payload })).unwrap()
      } else {
        const payload: CreateUser = {
          description: values.description || null,
          email: values.email || null,
          fullName: values.fullName || null,
          menuIds: values.menuIds.map(String),
          mobile: values.mobile || null,
          password: values.password || '',
          uniqueIdentifier: values.uniqueIdentifier || null,
        }
        await dispatch(createUserThunk(payload)).unwrap()
      }

      setOpen(false)
      setTimeout(() => {
        toast.success(isEdit ? 'کاربر با موفقیت ویرایش شد' : 'کاربر با موفقیت افزوده شد')
      }, 100)
      onSuccess?.()
    } catch (err: any) {
      if (err?.fields?.length) {
        err.fields.forEach((f: { key: string; messages?: string[] }) => {
          const key = f.key.replace('$.', '') as keyof UserFormValues
          setError(key, { message: f.messages?.[0] ?? 'خطا' })
        })
        return
      }
      const message =
        typeof err === 'string' ? err : (err?.displayMessage ?? 'خطا در ارتباط با سرور')
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[95vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-6">
          <FormSection title="اطلاعات کاربر">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldRow
                icon={<UserIcon className="w-7 h-5 text-sm" />}
                label="نام و نام خانوادگی"
                error={errors.fullName?.message}
                w={22}
              >
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field }) => (
                    <Input
                      {...field}
                      className={
                        errors.fullName
                          ? 'border border-red-300 focus:border-red-300 focus:ring-red-300 focus-visible:border-red-300 focus-visible:ring-red-300'
                          : ''
                      }
                    />
                  )}
                />
              </FieldRow>

              {!isEdit && (
                <FieldRow
                  icon={<IdCardIcon className="w-7 h-5 text-sm" />}
                  label="کد ملی (نام کاربری)"
                  error={errors.uniqueIdentifier?.message}
                  w={18}
                >
                  <Controller
                    control={control}
                    name="uniqueIdentifier"
                    render={({ field }) => (
                      <Input
                        {...field}
                        inputMode="numeric"
                        maxLength={10}
                        dir="ltr"
                        onChange={e => {
                          const v = normalizeDigits(e.target.value).replace(/\D/g, '')
                          field.onChange(v)
                        }}
                        className={
                          errors.uniqueIdentifier
                            ? 'border border-red-300 focus:border-red-300 focus:ring-red-300 focus-visible:border-red-300 focus-visible:ring-red-300'
                            : ''
                        }
                      />
                    )}
                  />
                </FieldRow>
              )}

              <FieldRow
                icon={<MailIcon className="w-7 h-5 text-sm" />}
                label="ایمیل"
                error={errors.email?.message}
                w={18}
              >
                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <Input
                      {...field}
                      dir="ltr"
                      className={
                        errors.email
                          ? 'border border-red-300 focus:border-red-300 focus:ring-red-300 focus-visible:border-red-300 focus-visible:ring-red-300'
                          : ''
                      }
                    />
                  )}
                />
              </FieldRow>

              <FieldRow
                icon={<PhoneIcon className="w-7 h-5 text-sm" />}
                label="موبایل"
                error={errors.mobile?.message}
                w={18}
              >
                <Controller
                  control={control}
                  name="mobile"
                  render={({ field }) => (
                    <Input
                      {...field}
                      inputMode="numeric"
                      placeholder="9123456789"
                      maxLength={10}
                      onChange={e => handleMobileChange(e.target.value, field.onChange)}
                      className={
                        errors.mobile
                          ? 'border border-red-300 focus:border-red-300 focus:ring-red-300 focus-visible:border-red-300 focus-visible:ring-red-300'
                          : ''
                      }
                    />
                  )}
                />
              </FieldRow>

              {isEdit && (
                <FieldRow
                  icon={<ShieldCheckIcon className="w-7 h-5 text-sm" />}
                  label="وضعیت"
                  error={errors.status?.message}
                  w={18}
                >
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          className={
                            errors.status
                              ? 'border border-red-400 focus:border-red-400 focus:ring-0 focus-visible:border-red-400 focus-visible:ring-0'
                              : ''
                          }
                        >
                          <SelectValue placeholder="انتخاب وضعیت" />
                        </SelectTrigger>
                        <SelectContent>
                          {userStatusOptions.map(opt => (
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

            <FieldRow
              icon={<FileTextIcon className="w-7 h-5 text-sm" />}
              label="توضیحات"
              error={errors.description?.message}
              w={22}
            >
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <Textarea
                    rows={3}
                    {...field}
                    className={
                      errors.description
                        ? 'border border-red-300 focus:border-red-300 focus:ring-red-300 focus-visible:border-red-300 focus-visible:ring-red-300'
                        : ''
                    }
                  />
                )}
              />
            </FieldRow>
          </FormSection>

          {!isEdit && (
            <FormSection title="امنیت">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldRow
                  icon={<KeyIcon className="w-7 h-5 text-sm" />}
                  label="رمز عبور"
                  error={errors.password?.message}
                  w={22}
                >
                  <Controller
                    control={control}
                    name="password"
                    render={({ field }) => (
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          {...field}
                          dir="ltr"
                          className={`pr-10 ${
                            errors.password
                              ? 'border border-red-300 focus:border-red-300 focus:ring-red-300 focus-visible:border-red-300 focus-visible:ring-red-300'
                              : ''
                          }`}
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    )}
                  />
                </FieldRow>

                <FieldRow
                  icon={<LockIcon className="w-7 h-5 text-sm" />}
                  label="تکرار رمز عبور"
                  error={errors.confirmPassword?.message}
                  w={22}
                >
                  <Controller
                    control={control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          {...field}
                          dir="ltr"
                          className={
                            errors.confirmPassword
                              ? 'border border-red-300 focus:border-red-300 focus:ring-red-300 focus-visible:border-red-300 focus-visible:ring-red-300'
                              : ''
                          }
                        />

                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(prev => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    )}
                  />
                </FieldRow>
              </div>
            </FormSection>
          )}

          <FormSection
            title="دسترسی‌ها"
            description="منوهایی که این کاربر به آن‌ها دسترسی خواهد داشت را انتخاب کنید"
          >
            <Controller
              control={control}
              name="menuIds"
              render={({ field }) => {
                // Toggling a node checkox
                const toggleMenu = (id: number, checked: boolean) => {
                  if (checked) {
                    field.onChange([...field.value, id])
                  } else {
                    field.onChange(field.value.filter((menuId: number) => menuId !== id))
                  }
                }

                // Toggle all childern by selecting their parent node
                const toggleWithChildren = (node: MenuTreeNode, checked: boolean) => {
                  const ids = collectIds(node)
                  if (checked) {
                    field.onChange(Array.from(new Set([...field.value, ...ids])))
                  } else {
                    field.onChange(field.value.filter((menuId: number) => !ids.includes(menuId)))
                  }
                }

                // Render each node and its childern recursively
                const renderNode = (node: MenuTreeNode, depth = 0) => {
                  const checked = field.value.includes(node.id)
                  const descendantIds = collectIds(node).filter(id => +id !== node.id)
                  const someChildrenChecked = descendantIds.some(id => field.value.includes(+id))
                  const isIndeterminate = !checked && someChildrenChecked
                  const isParent = node.children.length > 0

                  return (
                    <div key={node.id}>
                      <CommandItem
                        value={`${node.name}-${node.id}`}
                        onSelect={() =>
                          node.children.length
                            ? toggleWithChildren(node, !checked)
                            : toggleMenu(node.id, !checked)
                        }
                        className="flex items-center gap-2 cursor-pointer mt-0.5"
                        style={{ paddingRight: depth * 20 + 8 }}
                      >
                        <Checkbox
                          checked={isIndeterminate ? 'indeterminate' : checked}
                          onCheckedChange={isChecked =>
                            node.children.length
                              ? toggleWithChildren(node, !!isChecked)
                              : toggleMenu(node.id, !!isChecked)
                          }
                          onClick={e => e.stopPropagation()}
                        />
                        <span
                          className={cn('text-sm', isParent && 'text-custom-primary font-medium')}
                        >
                          {node.name}
                        </span>
                      </CommandItem>
                      {node.children.map(child => renderNode(child, depth + 1))}
                    </div>
                  )
                }

                // ---- content shown inside the popover ----
                let popoverBody: React.ReactNode

                if (menusLoading) {
                  popoverBody = (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 px-3">
                      <Loader2Icon className="w-4 h-4 animate-spin" />
                      در حال دریافت منوها...
                    </div>
                  )
                } else if (menusError) {
                  popoverBody = (
                    <div className="flex items-center gap-3 text-sm text-destructive py-2 px-3">
                      {menusError}
                      <Button type="button" variant="outline" size="sm" onClick={refetchMenus}>
                        تلاش مجدد
                      </Button>
                    </div>
                  )
                } else if (!menuTree.length) {
                  popoverBody = (
                    <p className="text-sm text-muted-foreground py-2 px-3">منویی یافت نشد</p>
                  )
                } else {
                  popoverBody = (
                    <Command>
                      <CommandInput placeholder="جستجوی منو..." />
                      <CommandList className="max-h-60" onWheel={e => e.stopPropagation()}>
                        <CommandEmpty>موردی یافت نشد</CommandEmpty>
                        <CommandGroup>
                          {menuTree.map((node, index) => (
                            <div key={node.id} className={index !== 0 ? 'mt-3' : undefined}>
                              {renderNode(node)}
                            </div>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  )
                }

                const selectedItems = field.value
                  .map((id: number) => {
                    const node = flattenTree(menuTree).find(n => n.id === id)
                    return node ? { id: node.id, name: node.name } : null
                  })
                  .filter(Boolean) as { id: number; name: string }[]

                return (
                  <Popover modal={false}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between font-normal h-auto min-h-9 py-2"
                      >
                        {selectedItems.length ? (
                          <div className="flex flex-wrap gap-1">
                            {selectedItems.map(item => (
                              <Badge
                                key={item.id}
                                variant="secondary"
                                className="font-normal gap-1 pr-1"
                              >
                                {item.name}
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation()
                                    field.onChange(
                                      field.value.filter((menuId: number) => menuId !== item.id)
                                    )
                                  }}
                                  className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                                  aria-label={`حذف ${item.name}`}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">انتخاب منو</span>
                        )}
                        <ChevronsUpDown className="w-4 h-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    {/* <PopoverPrimitive.Portal container={dialogContentRef.current ?? undefined}> */}
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      {popoverBody}
                    </PopoverContent>
                    {/* </PopoverPrimitive.Portal> */}
                  </Popover>
                )
              }}
            />
            {errors.menuIds?.message && (
              <p className="text-xs text-destructive mt-1">{errors.menuIds.message}</p>
            )}
          </FormSection>

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
              {isSubmitting ? 'در حال ذخیره...' : isEdit ? 'ویرایش' : 'افزودن'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
