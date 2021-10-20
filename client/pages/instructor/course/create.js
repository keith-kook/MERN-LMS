import React, { useState } from 'react';
import axios from 'axios';
import InstructorRoute from '../../../components/routes/InstructorRoute';
import CourseCreateForm from '../../../components/forms/CourseCreateForm';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

const CourseCreate = () => {
  // state
  const [values, setValues] = useState({
    name: '',
    description: '',
    price: '9.99',
    uploading: false,
    paid: true,
    category: '',
    loading: false,
  });
  const [image, setImage] = useState({});
  const [preview, setPreview] = useState('');
  const [uploadButtonText, setUploadButtonText] = useState('Upload Image');

  // router
  const router = useRouter();

  const handleChange = e => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleImage = async e => {
    let file = e.target.files[0];
    if (!file) return res.status(400).send('No image');
    setPreview(window.URL.createObjectURL(file));
    setUploadButtonText(file.name);
    setValues({ ...values, loading: true });

    // upload image
    try {
      const formData = new FormData();
      formData.append('courseImage', file);
      let { data } = await axios.post('/api/course/upload-image', formData);
      //console.log(`UPLOAD_IMAGE:${JSON.stringify(data)}`);
      // set image in the state
      setImage(data);
      setValues({ ...values, loading: false });
    } catch (err) {
      console.log(err);
      setValues({ ...values, loading: false });
      toast('Image upload failed. Try later.');
    }

    // const formData = new FormData();
    // formData.append('courseImage', e.target.files[0]);

    // axios.post('/api/course/upload-image', formData, {}).then(res => {
    //   console.log(res);
    // });
  };

  const handleImageRemove = async () => {
    try {
      // console.log(values);
      setValues({ ...values, loading: true });
      const res = await axios.post('/api/course/remove-image', { image });
      setImage({});
      setPreview('');
      setUploadButtonText('Upload Image');
      setValues({ ...values, loading: false });
    } catch (err) {
      console.log(err);
      setValues({ ...values, loading: false });
      toast('Can not delete file. Please contact administrator.');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      // console.log(values);
      const { data } = await axios.post('/api/course', {
        ...values,
        image,
      });
      toast('Great! Now you can start adding lessons');
      router.push('/instructor');
    } catch (err) {
      toast(err.response.data);
    }
  };

  return (
    <InstructorRoute>
      <h1 className='jumbotron text-center square'>Create Course</h1>
      <div className='pt-3 pb-3'>
        <CourseCreateForm
          handleSubmit={handleSubmit}
          handleImage={handleImage}
          handleChange={handleChange}
          values={values}
          setValues={setValues}
          preview={preview}
          uploadButtonText={uploadButtonText}
          handleImageRemove={handleImageRemove}
        />
      </div>
      <pre>{JSON.stringify(values, null, 4)}</pre>
      <hr />
      <pre>{JSON.stringify(image, null, 4)}</pre>
    </InstructorRoute>
  );
};

export default CourseCreate;
