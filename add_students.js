async function run() {
  const SHARED_CLOUD_URL = 'https://jsonblob.com/api/jsonBlob/019fefdd-2122-7f86-b164-fcca00927ee8';

  try {
    // 1. Fetch current data
    console.log('Fetching data from cloud...');
    const res = await fetch(SHARED_CLOUD_URL, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!res.ok) throw new Error('Failed to fetch data');
    
    const data = await res.json();
    
    let students = data['sanad_students'] || [];
    
    const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 7);

    const newStudents = [
      {
        id: generateId(),
        firstName: 'سامي',
        lastName: 'شهادة',
        age: 11,
        gender: 'ذكر',
        avatar: 'boy1',
        level: 'مبتدئ',
        group: 'الفوج 1',
        registrationDate: new Date().toISOString().split('T')[0],
        notes: '',
        memorization: [],
        lastUpdate: new Date().toISOString().split('T')[0]
      },
      {
        id: generateId(),
        firstName: 'لؤي',
        lastName: 'شهادة',
        age: 13,
        gender: 'ذكر',
        avatar: 'boy2',
        level: 'مبتدئ',
        group: 'الفوج 1',
        registrationDate: new Date().toISOString().split('T')[0],
        notes: '',
        memorization: [],
        lastUpdate: new Date().toISOString().split('T')[0]
      },
      {
        id: generateId(),
        firstName: 'عبير',
        lastName: 'اليهوم',
        age: 12,
        gender: 'أنثى',
        avatar: 'girl1',
        level: 'مبتدئ',
        group: 'الفوج 1',
        registrationDate: new Date().toISOString().split('T')[0],
        notes: '',
        memorization: [],
        lastUpdate: new Date().toISOString().split('T')[0]
      },
      {
        id: generateId(),
        firstName: 'أسماء',
        lastName: 'كاملي',
        age: 11,
        gender: 'أنثى',
        avatar: 'girl2',
        level: 'مبتدئ',
        group: 'الفوج 1',
        registrationDate: new Date().toISOString().split('T')[0],
        notes: '',
        memorization: [],
        lastUpdate: new Date().toISOString().split('T')[0]
      }
    ];

    students = [...students, ...newStudents];
    data['sanad_students'] = students;
    data['sanad_last_update'] = Date.now(); // Update timestamp so browser pulls it

    console.log('Pushing updated data to cloud...');
    const putRes = await fetch(SHARED_CLOUD_URL, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
      },
      body: JSON.stringify(data)
    });

    if (!putRes.ok) throw new Error('Failed to push data: ' + putRes.status + ' ' + await putRes.text());

    console.log('Successfully added students to cloud!');
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
