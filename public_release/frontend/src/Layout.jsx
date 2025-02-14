import { Outlet } from "react-router-dom";
import FixedHeader from "./components/FixedHeader";

export default function Layout() {
    return(<div className="">
        <FixedHeader/>
        <Outlet/>
    </div>);
}

//<HeaderF/>