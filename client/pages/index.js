import axios from 'axios';
import CourseCard from '../components/cards/CourseCard';
import { useState, useEffect } from 'react';

const Index = ({ courses }) => {
  // const [courses, setCourses] = useState([]);
  // useEffect(() => {
  //   const fetchCourses = async () => {
  //     const { data } = await axios.get('/api/courses');
  //     setCourses(data);
  //   };
  //   fetchCourses();
  //   return () => {
  //     setCourses([]);
  //   };
  // }, []);

  return (
    <>
      <div className='jumbotron text-center bg-primary square'>
        <h1>Become A FullStack Web Developer</h1>
        <hr style={{ borderBottom: '2px solid silver', width: '100px' }} />
        <p className='lead'>
          Master JavaScript React Node MongoDB MERN Stack & Start Building Real
          Projects
        </p>
      </div>
      <div className='container-fluid'>
        <div className='row pt-2'>
          {courses.map(course => (
            <div key={course._id} className='col-md-4'>
              <CourseCard key={course._id} course={course} />
              {/* <pre>{JSON.stringify(course, null, 4)}</pre> */}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export async function getServerSideProps() {
  const { data } = await axios.get(`http://localhost:8000/api/courses`);
  // console.log("DATA LENGTH =====> ", data.length);
  return {
    props: {
      courses: data,
    },
  };
}

export default Index;
