import './Product.css'
import product from '../../assets/image/product.jpg';
import Advertisement from '../../components/advertisement/advertisement';
export default function Product (){
    return(
        <div className="product-page-container">
            <div className="product-page-wrapper">
                <h2>Irrigation Kits</h2>
                <div className="product-page-grid">
                    <div className="related-products">
                        <img src={product} alt="Product Image" /> 
                        <img src={product} alt="Product Image" /> 
                        <img src={product} alt="Product Image" /> 
                    </div>
                    <div className="product-general-image">
                        <img src={product} alt="Product Image" /> 
                    </div>
                    <div className="product-details">
                        <p>Maintain your crops efficiency with a comprehensive pruning toolkit.
                            This set of specialised tools allows farmers to shape plants, remove dead branches and stimulate growth.
                        </p>
                        <input type="number"
                        placeholder='Quantity:'
                        required
                        min={1}
                        value={1}
                         />
                         <button>Buy now</button>
                    </div>
                </div>
            </div>
            <Advertisement />
        </div>
    );
}