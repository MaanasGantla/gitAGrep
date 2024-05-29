import { Link } from "react-router-dom"

export function Navbar()
{
    return (

        <>
            <Link to="/"> 
                <button> Home </button> 
            </Link>
            <Link to="/Login"> 
                <button> Log In </button> 
            </Link>
            <Link to="/BookInformation">
                <button> Book Information Page </button>
            </Link>
        </>

    )
}