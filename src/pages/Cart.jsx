import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';

function Cart() {
  // eslint-disable-next-line
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    parking: true,
    used: true,
    promoCode: '',
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
  });

  const { used, promoCode, offer, regularPrice, discountedPrice } = formData;

  const navigate = useNavigate();
  const params = useParams();
  let validStatus = false;

  // Fetch listing to edit
  useEffect(() => {
    setLoading(true);
    const fetchListing = async () => {
      const docRef = doc(db, 'listings', params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormData({ ...docSnap.data() });
        setLoading(false);
      } else {
        navigate('/');
        toast.error('Listing does not exist');
      }
    };

    fetchListing();
  }, [params.listingId, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    setFormData((prevState) => ({
      ...prevState,
    }));

    const formDataCopy = {
      ...formData,
      timestamp: serverTimestamp(),
    };
    console.log(formDataCopy);

    !formDataCopy.offer && delete formDataCopy.discountedPrice;

    const docRef = doc(db, 'listings', params.listingId);
    await updateDoc(docRef, formDataCopy);
    setLoading(false);
    toast.success('Applied Promotion Code');
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };

  const onMutate = async (e) => {
    let boolean = null;

    if (e.target.value === 'true') {
      boolean = true;
    }
    if (e.target.value === 'false') {
      boolean = false;
      toast.error('The website is only designed for using a promotion code, please select "Yes".')
    }

    // Text/Booleans/Numbers
    if (!e.target.files) {
      if (e.target.id === 'offer') {
        setFormData((prevState) => ({
          ...prevState,
          [e.target.id]: boolean ?? e.target.value,
          // ["parking"]: false, // test
        }));
        validStatus = true
      } 
      else {
        // one-time promo code
        // try to apply promotion code
        if (e.target.id === 'promoCode'){
          // promotion code is valid
          if (e.target.value === promoCode) {
            // promotion code has not been used
            if (used === false) {
              setFormData((prevState) => ({
                ...prevState,
                // ["parking"]: false, // test,
                ["used"]: true,
              }));
            } else {
              toast.error('Promotion Code has been used.')
            }
          } else {
            toast.error('Promotion Code is not valid');
          }
        }
      }
      
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Apply Promotion Code</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <label className="formLabel">Offer</label>
          <div className="formButtons">
            <button
              className={offer ? 'formButtonActive' : 'formButton'}
              type="button"
              id="offer"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              type="button"
              id="offer"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel">Regular Price</label>
          <div className="formPriceDiv">
            
          <p className="logOut">{regularPrice}</p>
          </div>

          {offer && (
            <>
              <label className="formLabel">Discounted Price</label>
              <div className="formPriceDiv">
                <p className="logOut">{discountedPrice}</p>
              </div>
              <label className="formLabel">Promotion Code</label>
              <div className="formPriceDiv">
                <input
                  type='text'
                  className="formInputSmall"
                  id="promoCode"
                  // value=""
                  onChange={onMutate}
                  required={offer}
                />
              </div>
            </>
          )}

          <button type="submit" className="primaryButton createListingButton">
            Add to Cart
          </button>
        </form>
      </main>
    </div>
  );
}

export default Cart;
