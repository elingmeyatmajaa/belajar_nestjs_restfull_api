import http from 'k6/http';
import { sleep } from 'k6';

// load token dari file
const tokens = open('./tokens.txt').split('\n').filter(t => t);

export const options = {
  vus: 1000, // 100 virtual users
  duration: '20s',
};

export default function () {
  // ambil token random
  const token = tokens[Math.floor(Math.random() * tokens.length)];

  const params = {
    headers: {
      Authorization: token,
    },
  };

  // hit endpoint
  http.get('http://localhost:3000/api/users/current', params);

  // simulasi user delay (real behavior)
  sleep(1);
}

// import http from 'k6/http';
// import { sleep } from 'k6';

// const tokens = open('./tokens.txt').split('\n').filter(t => t);

// export const options = {
//   vus: 500,
//   duration: '30s',
// };

// export default function () {
//   const token = tokens[Math.floor(Math.random() * tokens.length)];

//   const params = {
//     headers: {
//       Authorization: token,
//     },
//   };

//   // 70% GET
//   http.get('http://localhost:3000/api/users/current', params);

//   // 20% UPDATE
//   if (Math.random() < 0.2) {
//     http.patch(
//       'http://localhost:3000/api/users/current',
//       JSON.stringify({ name: 'Updated User' }),
//       { headers: { ...params.headers, 'Content-Type': 'application/json' } }
//     );
//   }

//   // 10% LOGOUT
//   if (Math.random() < 0.1) {
//     http.del('http://localhost:3000/api/users/current', null, params);
//   }

//   sleep(1);
// }