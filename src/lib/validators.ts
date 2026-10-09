export function validateLoginInput(email: string, password: string) {
  if(!email || !password) throw new Error("Email and password are required")
  if(!email.includes("@")) throw new Error("Invalid email format")
}

export function validateRegisterInput(name: string, email: string, phone: string, password: string) {
  if(!name || !email || !phone || !password) {
    throw new Error("All fields are required")
  }
  if(!email.includes("@")) {
    throw new Error("Invalid email format")
  }
  if(phone.length < 10) {
    throw new Error("Invalid phone number")
  }
  if(password.length < 8) {
    throw new Error("Password must be at least 8 characters")
  }
}