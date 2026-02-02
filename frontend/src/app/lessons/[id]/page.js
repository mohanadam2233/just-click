import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import lessons from "@/../public/fakedata/lessons.json";
import LessonMain from "@/components/layout/main/LessonMain";
import { notFound } from "next/navigation";
export async function generateMetadata({ params }) {
  const { id } = lessons?.find(({ id }) => id == params.id) || { id: 1 };
  return {
    title: `Lesson ${
      id == 1 ? "" : id < 10 ? "0" + id : id
    } | Edurock - Education LMS Template`,
    description: `Lesson ${
      id == 1 ? "" : "0" + id
    } | Edurock - Education LMS Template`,
  };
}
const Lesson = ({ params }) => {
  const { id } = params;
  const isExistLesson = lessons?.find(({ id: id1 }) => id1 === parseInt(id));
  if (!isExistLesson) {
    notFound();
  }
  return (
    <PageWrapper>
      <main>
        <LessonMain id={params?.id} />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};
export async function generateStaticParams() {
  return lessons?.map(({ id }) => ({ id: id.toString() }));
}
export default Lesson;
