
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';

const SlideShow = ({ images }) => {
  const slideImages = images;

  const properties = {
    duration: 4000,
    transitionDuration: 500,
    infinite: true,
    indicators: true,
    arrows: false,
  };

  return (
    <div className="slide-container" style={{ height: '85%' }}>
      <style>
        {`
          .each-slide {
            transition-timing-function: ease-in-out !important;
            display: flex;
            align-items: center;
            justify-content: bottom;
            width: 100%;
            padding:50px;
            position:relative;
          }
        `}
      </style>
      <Slide {...properties}>
        {slideImages.map((image, index) => (
          <div key={index} className="each-slide" style={{ borderTopRightRadius : '27px',borderTopLeftRadius : '27px',height: '500px', backgroundSize: 'cover',backgroundPosition : 'top', backgroundImage: `url(${image.url})` }}>
            <span style={{position : 'absolute',left : '50px' ,bottom : '50px'}}>{image.text}</span>
          </div>
        ))}
      </Slide>
    </div>
  );
};

export default SlideShow;
