
"use client";

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center py-12">
      <SignUp path="/admin/sign-up" routing="path" signInUrl="/admin" afterSignUpUrl="/admin/dashboard"/>
    </div>
  );
}
