import {RxSocket} from '.';

const requestString = `GET / HTTP/1.1
User-Agent: Mozilla/4.0 (compatible; MSIE5.01; Windows NT)
Host: localhost
Connection: close

`;

const s = new RxSocket();
s.once('connect').subscribe(() => console.log('connected'));
s.on('close').subscribe(() => {
  console.log('closed');
});
s.on('data').subscribe(x => {
  console.log(x.toString('utf-8'));
});

s.connect({ host: '127.0.0.1', port: 80 });
s.write(Buffer.from(requestString, 'utf-8'));
