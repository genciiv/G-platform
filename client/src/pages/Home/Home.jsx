import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ paddingTop: 10 }}>
      <h1>G-App Store</h1>
      <p>Blej shpejt, thjesht, dhe me Cash on Delivery.</p>
      <Link to="/products">Shiko produktet →</Link>
    </div>
  );
}
