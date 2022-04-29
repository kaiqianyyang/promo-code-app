import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid'; // npm i uuid
import Spinner from '../components/Spinner';

function Cart() {
  // eslint-disable-next-line
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // type: 'dog',
    // name: '',
    parking: true,
    used: true,
    // address: '',
    promoCode: '',
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    // imgUrls: {},
  });

  const { parking, used, promoCode, offer, regularPrice, discountedPrice } = formData;

  const navigate = useNavigate();
  const params = useParams();

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

    delete formDataCopy.images;
    !formDataCopy.offer && delete formDataCopy.discountedPrice;

    const docRef = doc(db, 'listings', params.listingId);
    await updateDoc(docRef, formDataCopy);
    setLoading(false);
    toast.success('Listing saved');
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };

  const onMutate = async (e) => {
    let boolean = null;

    if (e.target.value === 'true') {
      boolean = true;
    }
    if (e.target.value === 'false') {
      boolean = false;
    }

    // Text/Booleans/Numbers
    if (!e.target.files) {
      if (e.target.id === 'offer') {
        setFormData((prevState) => ({
          ...prevState,
          [e.target.id]: boolean ?? e.target.value,
          // ["parking"]: false, // test
        }));
      } 
      else {
        // one-time promo code
        if (e.target.id === 'promoCode' && e.target.value === promoCode && used === false)
        setFormData((prevState) => ({
          ...prevState,
          // ["parking"]: false, // test,
          ["used"]: true,
        }));
      }
      
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Add to cart</p>
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
