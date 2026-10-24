import Footer from "@/component/Footer";
import Nav from "@/component/Nav";
import PublicHome from "@/component/PublicHome";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-white">
      <Nav/>
      <PublicHome/>
      <Footer/>
    </div>
  );
}
