import Layout from "@/components/layout/Layout";
import Agents1 from "@/components/sections/Agents1";
import Banner from "@/components/sections/Banner";
import Benefit1 from "@/components/sections/Benefit1";
import Benefit2 from "@/components/sections/Benefit2";
import Benefit3 from "@/components/sections/Benefit3";
import Categories1 from "@/components/sections/Categories1";
import Categories2 from "@/components/sections/Categories2";
import Categories3 from "@/components/sections/Categories3";
import LatestNew1 from "@/components/sections/LatestNew1";
import LatestNew2 from "@/components/sections/LatestNew2";
import LatestNew3 from "@/components/sections/LatestNew3";
import LatestNew4 from "@/components/sections/LatestNew4";
import LatestNew5 from "@/components/sections/LatestNew5";
import Location1 from "@/components/sections/Location1";
import Location2 from "@/components/sections/Location2";
import Location3 from "@/components/sections/Location3";
import Location4 from "@/components/sections/Location4";
import Location5 from "@/components/sections/Location5";
import Partner from "@/components/sections/Partner";
import Property1 from "@/components/sections/Property1";
import Property2 from "@/components/sections/Property2";
import Property3 from "@/components/sections/Property3";
import Property4 from "@/components/sections/Property4";
import Recommended1 from "@/components/sections/Recommended1";
import Recommended2 from "@/components/sections/Recommended2";
import Recommended3 from "@/components/sections/Recommended3";
import Recommended4 from "@/components/sections/Recommended4";
import Service1 from "@/components/sections/Service1";
import Service2 from "@/components/sections/Service2";
import Service3 from "@/components/sections/Service3";
import Service4 from "@/components/sections/Service4";
import Service5 from "@/components/sections/Service5";
import Slider1 from "@/components/sections/Slider1";
import Slider2 from "@/components/sections/Slider2";
import Slider3 from "@/components/sections/Slider3";
import Slider4 from "@/components/sections/Slider4";
import Testimonial1 from "@/components/sections/Testimonial1";
export default function Home() {
  return (
    <>
      <Layout headerStyle={1} footerStyle={1}>
        <Slider1 />
        <Recommended4 />
        {/* <Service5 /> */}
        {/* <Location3 /> */}
        <Testimonial1 />
        <LatestNew3 />
        {/* <Banner /> */}
      </Layout>
    </>
  );
}
