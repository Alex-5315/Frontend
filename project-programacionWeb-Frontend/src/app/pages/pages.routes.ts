import { Route } from "@angular/router";
import { UsersComponent } from "./users/users.component";
import { ProjectsComponent } from "./projects/projects.component";
import { ModalViewProjectComponent } from "./modal-view-project/modal-view-project.component";
// import { ProjectDetailComponent } from "./projects-detail/project-detail.component";
import { AdminGuard } from "@core/guard/admin.guard";

export const PAGES_ROUTE: Route[] = [
    {
        path: "users",
        component: UsersComponent,
        canActivate: [AdminGuard]
    },
    {
        path: "projects",
        component: ProjectsComponent,
    },
    {
        path: "projects/detail/:id", // ✅ Agregar la ruta para los detalles de proyecto
        component: ModalViewProjectComponent,
    },
];