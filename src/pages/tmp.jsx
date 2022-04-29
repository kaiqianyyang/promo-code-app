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
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid'; // npm i uuid
import Spinner from '../components/Spinner';

function Cart() {
  // eslint-disable-next-line
  const [formData, setFormData] = useState('');
  const [listing, setListing] = useState('');

  const auth = getAuth();
  const navigate = useNavigate();
  const params = useParams();
  const isMounted = useRef(true);

  // Fetch listing to edit
  useEffect(() => {
    const fetchListing = async (e) => {
      const docRef = doc(db, 'listings', params.listingId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setListing(docSnap.data());
        setFormData(docSnap.data());
      }
      console.log(docSnap.data());
    };

    // offer = listing.offer;

    fetchListing();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();

    // setLoading(true);

    // if (discountedPrice >= regularPrice) {
    //   setLoading(false);
    //   toast.error('Discounted price needs to be less than regular price');
    //   return;
    // }

    // if (images.length > 6) {
    //   setLoading(false);
    //   toast.error('Max 6 images');
    //   return;
    // }

    let geolocation = {};
    let location;

    // if (geolocationEnabled) {
    //   const response = await fetch(
    //     // `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`
    //     // API_KEY=1464460052555b4bd2bfefce3107d85e
    //     `https://api.positionstack.com/v1/forward?access_key=1464460052555b4bd2bfefce3107d85e&query=${address}`
    //   );

    //   //   console.log("location 111:");
    //   const data = await response.json();
    //   // console.log(data);

    //   //   geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
    //   //   geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;
    //   setFormData(
    //     (prevState) => ({
    //       ...prevState,
    //       latitude: data.data[0]?.latitude ?? 0,
    //       longitude: data.data[0]?.longitude ?? 0,
    //     }),
    //     (location = data.data[0] ? data.data[0]?.label : undefined)
    //   );

    //   if (location === undefined || location.includes('undefined')) {
    //     setLoading(false);
    //     toast.error('Please enter a correct address');
    //     return;
    //   }
    // } else {
    //   geolocation.lat = latitude;
    //   geolocation.lng = longitude;
    // }

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
      [...listing.images].map((image) => storeImage(image))
    ).catch(() => {
      //   setLoading(false);
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

    formDataCopy.location = listing.address;
    delete formDataCopy.images;
    delete formDataCopy.address;
    !formDataCopy.offer && delete formDataCopy.discountedPrice;

    const docRef = doc(db, 'listings', params.listingId);
    await updateDoc(docRef, formDataCopy);
    // setLoading(false);
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

    // // Files
    // if (e.target.files) {
    //   console.log(1);
    //   setFormData((prevState) => ({
    //     ...prevState,
    //     images: e.target.files,
    //   }));
    // }

    // Text/Booleans/Numbers
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  };

  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Add to cart</p>
      </header>

      <main>
        {/* <form onSubmit={onSubmit}> */}
        <form onSubmit={onSubmit}>
          <div>{listing.bathrooms}</div>

          <label className="formLabel">Offer</label>
          <div className="formButtons">
            <button
              className={listing.offer ? 'formButtonActive' : 'formButton'}
              type="button"
              id="offer"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !listing.offer && listing.offer !== null
                  ? 'formButtonActive'
                  : 'formButton'
              }
              type="button"
              id="offer"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <button type="submit" className="primaryButton createListingButton">
            Edit Listing
          </button>
        </form>
      </main>
    </div>
  );
}

export default Cart;
