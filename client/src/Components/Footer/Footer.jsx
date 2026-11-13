import React from 'react'
import "./footer.css"
function Footer() {
  return (
    <div>
        <footer>
<div class="footer">
<div class="row">
<span aria-label="Facebook"><i class="fa fa-facebook"></i></span>
<span aria-label="Instagram"><i class="fa fa-instagram"></i></span>
<span aria-label="YouTube"><i class="fa fa-youtube"></i></span>
<span aria-label="Twitter"><i class="fa fa-twitter"></i></span>

</div>

<div class="row services">
<ul>
<li><span>Contact us</span></li>
<li><span>Our Services</span></li>
<li><span>Privacy Policy</span></li>
<li><span>Terms & Conditions</span></li>
<li><span>Career</span></li>
</ul>
</div>

<div class="row">
INTERNAREA Copyright © {new Date().getFullYear()} InternArea - All rights reserved || Designed By: Imran 
</div>
</div>
</footer>
    </div>
  )
}

export default Footer




