declare namespace PharmaPlatform {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
  }

  interface Product {
    id: string;
    title: string;
    price: number;
    inventory: number;
  }
}

export {};
