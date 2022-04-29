import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import {
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid'; // npm i uuid
import Spinner from '../components/Spinner';

function Cart() {
    // eslint-disable-next-line
    const [geolocationEnabled, setGeolocationEnabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const [listing, setListing] = useState(false);
    const [formData, setFormData] = useState({
      type: 'dog',
      name: '',
      bedrooms: 1,
      bathrooms: 1,
      parking: false,
      furnished: false,
      address: '',
      offer: false,
      regularPrice: 0,
      discountedPrice: 0,
      images: {},
      latitude: 0,
      longitude: 0,
    });
  
    const {
      type,
      name,
      bedrooms,
      bathrooms,
      parking,
      furnished,
      address,
      offer,
      regularPrice,
      discountedPrice,
      images,
      latitude,
      longitude,
    } = formData;
  
    const auth = getAuth();
    const navigate = useNavigate();
    const params = useParams();
  
    // Fetch listing to edit
    useEffect(() => {
      setLoading(true);
      const fetchListing = async () => {
        const docRef = doc(db, 'listings', params.listingId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setListing(docSnap.data());
          setFormData({ ...docSnap.data(), address: docSnap.data().location });
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
      
  
      let geolocation = {};
  
      setFormData(
        (prevState) => ({
          ...prevState,
          latitude: 0,
          longitude: 0,
        })
      );
  
      // Store image in firebase
      const storeImage = async (image) => {
        return new Promise((resolve, reject) => {
          const storage = getStorage();
          const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
  
          const storageRef = ref(storage, 'images/' + fileName);
  
          const uploadTask = uploadBytesResumable(storageRef, image);
  
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log('Upload is ' + progress + '% done');
              switch (snapshot.state) {
                case 'paused':
                  console.log('Upload is paused');
                  break;
                case 'running':
                  console.log('Upload is running');
                  break;
                default:
                  break;
              }
            },
            (error) => {
              reject(error);
            },
            () => {
              // Handle successful uploads on complete
              // For instance, get the download URL: https://firebasestorage.googleapis.com/...
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                resolve(downloadURL);
              });
            }
          );
        });
      };
  
      const imgUrls = await Promise.all(
        [...images].map((image) => storeImage(image))
      ).catch(() => {
        setLoading(false);
        toast.error('Images not uploaded');
        return;
      });
  
      const formDataCopy = {
        ...formData,
        imgUrls,
        geolocation,
        timestamp: serverTimestamp(),
      };
      console.log(formDataCopy);
  
      formDataCopy.location = address;
      delete formDataCopy.images;
      delete formDataCopy.address;
      !formDataCopy.offer && delete formDataCopy.discountedPrice;
  
      const docRef = doc(db, 'listings', params.listingId);
      await updateDoc(docRef, formDataCopy)
      // await updateDoc(docRef, {parking: false})
      setLoading(false);
      toast.success('Listing saved');
      navigate(`/category/${formDataCopy.type}/${docRef.id}`);
    };
  
    const onMutate = (e) => {
      let boolean = null;
  
      if (e.target.value === 'true') {
        boolean = true;
      }
      if (e.target.value === 'false') {
        boolean = false;
      }
  
      // Files
      if (e.target.files) {
        console.log(1);
        setFormData((prevState) => ({
          ...prevState,
          images: e.target.files,
        }));
      }
  
      // Text/Booleans/Numbers
      if (!e.target.files) {
        setFormData((prevState) => ({
          ...prevState,
          [e.target.id]: boolean ?? e.target.value,
        }));
      }
    };
  
    if (loading) {
      return <Spinner />;
    }

  return (
    <div className='profile'>
      <header>
        <p className='pageHeader'>Add to cart</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
            
          <label className='formLabel'>Offer</label>
          <div className='formButtons'>
            <button
              className={offer ? 'formButtonActive' : 'formButton'}
              type='button'
              id='offer'
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='offer'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Regular Price</label>
          <div className='formPriceDiv'>
            <input
              className='formInputSmall'
              type='text'
              id='regularPrice'
              value={regularPrice}
              onChange={onMutate}
              min='50'
              max='750000000'
              required
            />
            {/* {<p className='formPriceText'>$</p>} */}
          </div>

          {offer && (
            <>
              <label className='formLabel'>Discounted Price</label>
              <input
                className='formInputSmall'
                type='text'
                id='discountedPrice'
                value={discountedPrice}
                onChange={onMutate}
                min='50'
                max='750000000'
                required={offer}
              />
              <label className='formLabel'>Promotion Code</label>
              <input
                className='formInputSmall'
                type='text'
                id='discountedPrice'
                value={discountedPrice}
                onChange={onMutate}
                min='50'
                max='750000000'
                required={offer}
              />
            </>
          )}

          <label className='formLabel'>Images</label>
          <p className='imagesInfo'>
            The first image will be the cover (max 6).
          </p>
          <input
            className='formInputFile'
            type='file'
            id='images'
            onChange={onMutate}
            max='6'
            accept='.jpg,.png,.jpeg'
            multiple
            required
          />
          
          <button type='submit' className='primaryButton createListingButton'>
            Add to Cart
          </button>
        </form>
      </main>
    </div>
  )
}

export default Cart