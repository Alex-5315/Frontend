import { Route } from "@angular/router";
import { UsersComponent } from "./users/users.component";
import { ProjectsComponent } from "./projects/projects.component";
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
]