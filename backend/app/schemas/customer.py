from pydantic import BaseModel, EmailStr

class CustomerInfo(BaseModel):
    name: str
    email: EmailStr
    phone: str
