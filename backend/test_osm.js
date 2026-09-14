const fetchJson = async (url) => {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

const testOSM = async () => {
  console.log('Testing OSM Integration...');
  try {
    const data = await fetchJson('http://localhost:5000/api/parking/search?location=Chennai');
    console.log('✅ OSM Search Success:');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('❌ OSM Search Failed:', err);
  }
};

testOSM();
