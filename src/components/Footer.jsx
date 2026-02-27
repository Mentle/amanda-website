import '../styles/footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-bottom">
        <p>&copy; {currentYear} Amanda Michelena. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
