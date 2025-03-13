import { Outlet, Link } from "react-router-dom";

const Menu = () => {
  return (
    <>
      <nav className="menu">
        <ul>
          <li>
            <Link to="/list">Liste 1-Wire</Link>
          </li>
          <li>
            <Link to="/slaves">Modules Esclave</Link>
          </li>
          <li>
            <Link to="/">R&eacute;gulation</Link>
          </li>
        </ul>
      </nav>

      <Outlet />
    </>
  )
};

export default Menu;
