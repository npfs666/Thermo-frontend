import { Outlet, Link } from "react-router-dom";

const Menu = () => {
  return (
    <>
      <nav className="menu">
        <ul>
          <li>
            <Link to="/">Liste 1-Wire</Link>
          </li>
          <li>
            <Link to="/slaves">Modules Esclave</Link>
          </li>
          <li>
            <Link to="/control">R&eacute;gulation</Link>
          </li>
        </ul>
      </nav>

      <Outlet />
    </>
  )
};

export default Menu;
