import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from './SignUp';
import Login from './Login';
import Home from './Home';
import DashboardA from './DashboardA';
import DashboardB from './DashboardB';
import Marketplace from './Marketplace';
import PlantDiseases from './PlantDiseases';
import FarmerProfile from './FarmerProfile';
import BuyNow from "./BuyNow";
import Cr from "./CropRptationPlanner";
import Profile from "./Profile";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboardA" element={<DashboardA />} />
        <Route path="/dashboardB" element={<DashboardB />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/plant-diseases" element={<PlantDiseases />} />
        <Route path="/buy-now/:productId" element={<BuyNow />} />
        <Route path="/farmer-profile" element={<FarmerProfile />} />
        <Route path="/crop-rotation" element={<Cr />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;