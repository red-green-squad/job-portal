import { db } from "@/db";
import { categories } from "@/db/schema";
import { CATEGORY_TYPES } from "@/lib/constants";
import { CategorySection } from "@/components/admin/category-section";
import { Separator } from "@/components/ui/separator";

export const metadata = { title: "Categories — Admin" };

export default async function CategoriesPage() {
  const allCategories = await db.select().from(categories).orderBy(categories.label);
  const roles = allCategories.filter((c) => c.type === CATEGORY_TYPES.ROLE);
  const experiences = allCategories.filter((c) => c.type === CATEGORY_TYPES.EXPERIENCE);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage the roles and experience levels available in job filters.
        </p>
      </div>

      <CategorySection title="Roles" type="role" items={roles} />
      <Separator />
      <CategorySection title="Experience Levels" type="experience" items={experiences} />
    </div>
  );
}
