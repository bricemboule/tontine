import CotisationShow from "@/features/cotisations/pages/CotisationShow";

export default function Show() {
  return <CotisationShow caps={{ enroll: true, pay: true, close: true, unenroll: true, }} />;
}
