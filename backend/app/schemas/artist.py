from pydantic import BaseModel
from typing import Optional

class ArtistBase(BaseModel):
    name: str
    biography: Optional[str] = None
    image_url: Optional[str] = None

class ArtistCreate(ArtistBase):
    pass

class ArtistRead(ArtistBase):
    id: int

    class Config:
        from_attributes = True
