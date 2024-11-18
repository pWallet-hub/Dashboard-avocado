import './advertisement.css'
export default function Advertisement () {
    return(
        <>
        <div className="advertisement">
        <div className="advertisement-head bg-blue-800">
          <h4>Take your Agribusiness to the next level</h4>
          <button>Get started</button>
          <div className="advertisement-picture">
          </div>
        </div>
        <h3>Visit Our Sites</h3>
        <a href="#"><button>Avocado Society</button></a><br />
        <a href="#"><button>OFAB Rwanda</button></a><br />
        <a href="#"><button>Alliance For Science</button></a>
      </div>
        </>
    );
}