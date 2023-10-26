import { useRouter } from 'next/router';
import { useState, useEffect, useLayoutEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';

function _arrayBufferToBase64(buffer) {
  // greets https://stackoverflow.com/a/9458996
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

const fetchImage = async (...args) => {
  const img = await fetch(...args);
  const expiryTime = new Date(img?.headers.get('expires'));
  const imageBuffer = await img.arrayBuffer();
  const imageBase64 = _arrayBufferToBase64(imageBuffer);
  return { expiryTime, imageBase64 };
};

export default function Slideshow() {
  const router = useRouter();
  const { channel } = router.query;
  const [imageHistory, setImageHistory] = useState([]);

  const { data, error } = useSWR(
    `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channel}-440x248.jpg`,
    fetchImage,
    { refreshInterval: 300000 }
  );

  useEffect(() => {
    if (data) {
      setImageHistory((prevHistory) => {
        console.log('Limiting the image history length to 16')
        const newHistory = [...prevHistory.slice(-15), data];
        return newHistory;
      });
    }
  }, [data]);


  useEffect(() => {
    setTimeout(() => {
      console.log('imageHistory got updated so we are scrolling to bottom')
      window.scrollTo(0, document.body.scrollHeight);
    }, 0)
  }, [imageHistory])

  if (error) return <div>Failed to load</div>;
  if (!data) return <p>No profile data</p>;

  return (
    <div>
      <p>Confettihat for <Link href={`https://twitch.tv/${router.query.channel}`}>{router.query.channel}</Link></p>
      {imageHistory.map((imageData, index) => (
        <img key={index} src={`data:image/jpeg;base64, ${imageData.imageBase64}`} />
      ))}

      <style jsx global>{`
        html,
        body {
          color: white;
          background-color: black;
        }
      `}</style>
    </div>
  );
}
