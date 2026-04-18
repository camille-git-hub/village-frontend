export type Listing = {
    _id: string;
    title: string;
    category: string;
    description: string;
    neighborhood: string;
    city: string;
    price?: number;
    lat: number;
    lng: number;
    ownerId: string;
    createdAt: string;
};

 export type FormDataType = {
  title: string;
  category: string;
  description: string;
  neighborhood: string;
  city: string;
  price?: number;
  address: string;
  lat: number | null;
  lng: number | null;
}