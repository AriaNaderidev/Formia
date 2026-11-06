import type { FormTemplate } from "./templates";

/**
 * Persian (right-to-left) versions of the basic templates. Field names match the English
 * ones, so the submitted data and the generated code keep the same keys in either language.
 */

const required = (requiredMessage: string) => ({ required: true, requiredMessage });
const optional = { required: false };

/** Persian Submit and Reset, as real buttons: the renderer's own defaults are English. */
const actions = (submitLabel: string): FormTemplate["fields"] => [
  { type: "button", label: submitLabel, name: "save", buttonType: "submit" },
  {
    type: "button",
    label: "انصراف",
    name: "reset",
    buttonType: "reset",
    buttonVariant: "outlined",
    pairWithPrevious: true,
  },
];

export const BASIC_TEMPLATES_FA: Record<string, FormTemplate> = {
  contact: {
    id: "contact-fa",
    title: "تماس با ما",
    description: "نام، ایمیل و پیام",
    direction: "rtl",
    fields: [
      { type: "heading", content: "با ما در تماس باشید" },
      { type: "paragraph", content: "معمولاً ظرف یک روز کاری پاسخ می‌دهیم." },
      { type: "text", label: "نام", name: "firstName", validation: required("نام الزامی است") },
      {
        type: "text",
        label: "نام خانوادگی",
        name: "lastName",
        pairWithPrevious: true,
        validation: required("نام خانوادگی الزامی است"),
      },
      { type: "email", label: "ایمیل", name: "email", validation: required("ایمیل الزامی است") },
      {
        type: "textarea",
        label: "پیام",
        name: "message",
        rowNumber: 4,
        validation: {
          ...required("پیام الزامی است"),
          useMinLength: true,
          minLength: 10,
          minLengthMessage: "پیام باید حداقل ۱۰ کاراکتر باشد",
        },
      },
      ...actions("ارسال پیام"),
    ],
  },

  signup: {
    id: "signup-fa",
    title: "ثبت‌نام",
    description: "اطلاعات حساب و پذیرش شرایط",
    direction: "rtl",
    fields: [
      { type: "heading", content: "حساب کاربری خود را بسازید" },
      {
        type: "email",
        label: "ایمیل سازمانی",
        name: "email",
        validation: required("ایمیل الزامی است"),
      },
      {
        type: "password",
        label: "رمز عبور",
        name: "password",
        validation: {
          ...required("رمز عبور الزامی است"),
          useMinLength: true,
          minLength: 8,
          minLengthMessage: "رمز عبور باید حداقل ۸ کاراکتر باشد",
        },
      },
      {
        type: "select",
        label: "اندازه تیم",
        name: "teamSize",
        validation: required("اندازه تیم الزامی است"),
        options: [
          { label: "فقط خودم", value: "1" },
          { label: "۲ تا ۱۰ نفر", value: "2-10" },
          { label: "۱۱ تا ۵۰ نفر", value: "11-50" },
          { label: "بیش از ۵۰ نفر", value: "50+" },
        ],
      },
      {
        type: "checkbox",
        label: "شرایط استفاده از خدمات را می‌پذیرم",
        name: "acceptTerms",
        validation: required("پذیرش شرایط الزامی است"),
      },
      ...actions("ثبت‌نام"),
    ],
  },

  feedback: {
    id: "feedback-fa",
    title: "بازخورد",
    description: "امتیاز، گزینه‌ها و نظرات",
    direction: "rtl",
    fields: [
      { type: "heading", content: "عملکرد ما چطور بود؟" },
      {
        type: "rating",
        label: "تجربه کلی شما",
        name: "rating",
        validation: required("لطفاً امتیاز دهید"),
      },
      {
        type: "radiogroup",
        label: "ما را به دیگران پیشنهاد می‌کنید؟",
        name: "recommend",
        validation: required("یک گزینه را انتخاب کنید"),
        options: [
          { label: "قطعاً", value: "yes" },
          { label: "شاید", value: "maybe" },
          { label: "نه واقعاً", value: "no" },
        ],
      },
      {
        type: "textarea",
        label: "چه چیزی را می‌توانیم بهتر کنیم؟",
        name: "comments",
        validation: optional,
      },
      ...actions("ارسال بازخورد"),
    ],
  },

  login: {
    id: "login-fa",
    title: "ورود",
    description: "ایمیل، رمز عبور و مرا به خاطر بسپار",
    direction: "rtl",
    fields: [
      { type: "heading", content: "خوش برگشتید" },
      { type: "email", label: "ایمیل", name: "email", validation: required("ایمیل الزامی است") },
      {
        type: "password",
        label: "رمز عبور",
        name: "password",
        validation: required("رمز عبور الزامی است"),
      },
      { type: "checkbox", label: "مرا به خاطر بسپار", name: "remember", validation: optional },
      { type: "button", label: "ورود", name: "signIn" },
    ],
  },

  newsletter: {
    id: "newsletter-fa",
    title: "خبرنامه",
    description: "عضویت با انتخاب موضوع‌ها و موافقت",
    direction: "rtl",
    fields: [
      { type: "heading", content: "در جریان باشید" },
      {
        type: "paragraph",
        content: "هفته‌ای یک ایمیل. هر زمان خواستید می‌توانید لغو عضویت کنید.",
      },
      { type: "text", label: "نام", name: "firstName", validation: required("نام الزامی است") },
      {
        type: "email",
        label: "ایمیل",
        name: "email",
        pairWithPrevious: true,
        validation: required("ایمیل الزامی است"),
      },
      {
        type: "checkboxgroup",
        label: "موضوع‌های مورد علاقه",
        name: "topics",
        validation: required("حداقل یک موضوع را انتخاب کنید"),
        options: [
          { label: "اخبار محصول", value: "product" },
          { label: "نکات و آموزش‌ها", value: "tips" },
          { label: "رویدادها", value: "events" },
        ],
      },
      {
        type: "checkbox",
        label: "با دریافت ایمیل موافقم",
        name: "consent",
        validation: required("موافقت با دریافت ایمیل الزامی است"),
      },
      ...actions("عضویت"),
    ],
  },

  "job-application": {
    id: "job-application-fa",
    title: "درخواست استخدام",
    description: "اطلاعات تماس، رزومه و انگیزه‌نامه",
    direction: "rtl",
    fields: [
      { type: "heading", content: "درخواست برای این موقعیت شغلی" },
      { type: "text", label: "نام", name: "firstName", validation: required("نام الزامی است") },
      {
        type: "text",
        label: "نام خانوادگی",
        name: "lastName",
        pairWithPrevious: true,
        validation: required("نام خانوادگی الزامی است"),
      },
      { type: "email", label: "ایمیل", name: "email", validation: required("ایمیل الزامی است") },
      {
        type: "tel",
        label: "تلفن",
        name: "phone",
        pairWithPrevious: true,
        validation: optional,
      },
      {
        type: "select",
        label: "موقعیت شغلی",
        name: "position",
        validation: required("موقعیت شغلی الزامی است"),
        options: [
          { label: "مهندس فرانت‌اند", value: "frontend" },
          { label: "مهندس بک‌اند", value: "backend" },
          { label: "طراح محصول", value: "designer" },
          { label: "سایر", value: "other" },
        ],
      },
      {
        type: "number",
        label: "سال‌های سابقه کار",
        name: "experience",
        pairWithPrevious: true,
        validation: {
          ...required("سابقه کار الزامی است"),
          useMin: true,
          min: 0,
          minMessage: "مقدار نمی‌تواند منفی باشد",
          useMax: true,
          max: 60,
          maxMessage: "مقدار نمی‌تواند بیشتر از ۶۰ باشد",
        },
      },
      {
        type: "url",
        label: "نمونه‌کار یا لینکدین",
        name: "portfolio",
        validation: optional,
      },
      { type: "file", label: "رزومه", name: "resume", validation: required("بارگذاری رزومه الزامی است") },
      {
        type: "textarea",
        label: "انگیزه‌نامه",
        name: "coverLetter",
        rowNumber: 5,
        validation: optional,
      },
      ...actions("ارسال درخواست"),
    ],
  },

  "event-registration": {
    id: "event-registration-fa",
    title: "ثبت‌نام رویداد",
    description: "بلیت، همراهان و ترجیح غذایی",
    direction: "rtl",
    fields: [
      { type: "heading", content: "ثبت‌نام در رویداد" },
      {
        type: "text",
        label: "نام و نام خانوادگی",
        name: "fullName",
        validation: required("نام و نام خانوادگی الزامی است"),
      },
      {
        type: "email",
        label: "ایمیل",
        name: "email",
        pairWithPrevious: true,
        validation: required("ایمیل الزامی است"),
      },
      {
        type: "select",
        label: "نوع بلیت",
        name: "ticketType",
        validation: required("نوع بلیت الزامی است"),
        options: [
          { label: "عادی", value: "standard" },
          { label: "ویژه", value: "vip" },
          { label: "دانشجویی", value: "student" },
        ],
      },
      {
        type: "number",
        label: "تعداد همراهان",
        name: "guests",
        defaultValue: 1,
        pairWithPrevious: true,
        validation: {
          ...required("تعداد همراهان الزامی است"),
          useMin: true,
          min: 1,
          minMessage: "حداقل ۱ نفر",
          useMax: true,
          max: 5,
          maxMessage: "حداکثر ۵ نفر",
        },
      },
      {
        type: "radiogroup",
        label: "ترجیح غذایی",
        name: "meal",
        validation: required("یک گزینه را انتخاب کنید"),
        options: [
          { label: "معمولی", value: "standard" },
          { label: "گیاهخوار", value: "vegetarian" },
          { label: "وگان", value: "vegan" },
        ],
      },
      {
        type: "textarea",
        label: "نیازهای دسترسی",
        name: "accessibility",
        rowNumber: 3,
        validation: optional,
      },
      ...actions("ثبت‌نام در رویداد"),
    ],
  },

  "support-ticket": {
    id: "support-ticket-fa",
    title: "تیکت پشتیبانی",
    description: "دسته‌بندی، اولویت و جزئیات",
    direction: "rtl",
    fields: [
      { type: "heading", content: "چطور می‌توانیم کمک کنیم؟" },
      {
        type: "email",
        label: "ایمیل شما",
        name: "email",
        validation: required("ایمیل الزامی است"),
      },
      {
        type: "select",
        label: "دسته‌بندی",
        name: "category",
        validation: required("دسته‌بندی الزامی است"),
        options: [
          { label: "صورتحساب", value: "billing" },
          { label: "گزارش خطا", value: "bug" },
          { label: "حساب کاربری", value: "account" },
          { label: "موارد دیگر", value: "other" },
        ],
      },
      {
        type: "radiogroup",
        label: "اولویت",
        name: "priority",
        validation: required("اولویت را انتخاب کنید"),
        options: [
          { label: "کم", value: "low" },
          { label: "عادی", value: "normal" },
          { label: "فوری", value: "urgent" },
        ],
      },
      { type: "text", label: "موضوع", name: "subject", validation: required("موضوع الزامی است") },
      {
        type: "textarea",
        label: "چه اتفاقی افتاد؟",
        name: "description",
        rowNumber: 5,
        validation: {
          ...required("توضیحات الزامی است"),
          useMinLength: true,
          minLength: 20,
          minLengthMessage: "توضیحات باید حداقل ۲۰ کاراکتر باشد",
        },
      },
      { type: "file", label: "پیوست", name: "attachment", validation: optional },
      ...actions("ارسال تیکت"),
    ],
  },

  appointment: {
    id: "appointment-fa",
    title: "نوبت‌دهی",
    description: "خدمت، تاریخ و اطلاعات تماس",
    direction: "rtl",
    fields: [
      { type: "heading", content: "رزرو نوبت" },
      {
        type: "text",
        label: "نام و نام خانوادگی",
        name: "fullName",
        validation: required("نام و نام خانوادگی الزامی است"),
      },
      {
        type: "tel",
        label: "تلفن",
        name: "phone",
        pairWithPrevious: true,
        validation: required("شماره تلفن الزامی است"),
      },
      { type: "email", label: "ایمیل", name: "email", validation: required("ایمیل الزامی است") },
      {
        type: "select",
        label: "خدمت",
        name: "service",
        validation: required("خدمت مورد نظر را انتخاب کنید"),
        options: [
          { label: "مشاوره", value: "consultation" },
          { label: "پیگیری", value: "follow-up" },
          { label: "جلسه کامل", value: "session" },
        ],
      },
      {
        type: "datetime",
        label: "تاریخ و ساعت دلخواه",
        name: "preferredAt",
        validation: required("تاریخ و ساعت الزامی است"),
      },
      { type: "textarea", label: "توضیحات", name: "notes", rowNumber: 3, validation: optional },
      ...actions("رزرو نوبت"),
    ],
  },
};
