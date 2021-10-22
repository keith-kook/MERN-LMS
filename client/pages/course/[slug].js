import { useState, useContext, useEffect } from 'react';
import { withRouter, useRouter } from 'next/router';
import axios from 'axios';

const SingleCourse = ({ course }) => {
  const router = useRouter;

  //const { slug } = router.query;
  return (
    <>
      <div className='container-fluid'>
        <div className='row'></div>
        <pre>{JSON.stringify(course, null, 4)}</pre>
      </div>
    </>
  );
};

// SingleCourse.getInitialProps = async ({ query }) => {
//   const { slug } = query;

//   return { slug };
// };

export async function getServerSideProps({ query }) {
  const { data } = await axios.get(
    `http://localhost:8000/api/course/${query.slug}`
  );
  return {
    props: {
      course: data,
    },
  };
}

export default SingleCourse;
