export class Project {
    id!: number;
    nombre!: string;
    descripcion!: string; 
    fechaCreacion!: Date;
    administradorId!: number;
    usuarios?: Array<{ id: number; nombre: string; email: string }>;
}
