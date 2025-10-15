import React from 'react';
import '../../styles/AuthComp.css';

const AuthComp = ({
    currentSection,
    onSectionChange,
    formData,
    onInputChange,
    onLoginSubmit,
    onSignUpSubmit,
    onCreatePasswordSubmit,
    onForgotPasswordSubmit,
    errors,
    isLoading
}) => {
    
    const renderLoginSection = () => (
        <div className={`form-section ${currentSection === 'login' ? 'active' : ''}`}>
            <div className="logo-container">
                <img src="/logo.jpg" alt="Stylescapes Logo" />
            </div>
            <form onSubmit={onLoginSubmit}>
                {errors.general && <p className="error-message">{errors.general}</p>}
                <div className="input_box">
                    <input type="text" id="login-email" className="input-field" name="email" required onChange={onInputChange} />
                    <label htmlFor="login-email" className="label">Email or Mobile</label>
                    <i className="bx bx-user icon"></i>
                </div>
                <div className="input_box">
                    <input type="password" id="login-pass" className="input-field" name="password" required onChange={onInputChange} />
                    <label htmlFor="login-pass" className="label">Password</label>
                    <i className="bx bx-lock-alt icon"></i>
                </div>
                <div className="remember-forgot">
                    <div className="remember-me">
                        <input type="checkbox" id="remember" />
                        <label htmlFor="remember"> Remember me</label>
                    </div>
                    <div className="forgot">
                        <a onClick={() => onSectionChange('forgot-password')}>Forgot password?</a>
                    </div>
                </div>
                <div className="input_box">
                    <button type="submit" className="input-submit" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </div>
                <div className="register">
                    <span>Don't have an account? <a onClick={() => onSectionChange('signup')}>Register</a></span>
                </div>
            </form>
        </div>
    );

    const renderSignUpSection = () => (
        <div className={`form-section ${currentSection === 'signup' ? 'active' : ''}`}>
            <div className="logo-container">
                <img src="/logo.jpg" alt="Stylescapes Logo" />
            </div>
            <form onSubmit={onSignUpSubmit}>
                {errors.general && <p className="error-message">{errors.general}</p>}
                <div className="name-fields">
                    <div className="input_box" style={{ marginTop: 0 }}>
                        <input type="text" id="fname" className="input-field" name="firstName" required onChange={onInputChange} />
                        <label htmlFor="fname" className="label">First Name</label>
                        <i className='bx bx-user-circle icon'></i>
                    </div>
                    <div className="input_box" style={{ marginTop: 0 }}>
                        <input type="text" id="lname" className="input-field" name="lastName" required onChange={onInputChange} />
                        <label htmlFor="lname" className="label">Last Name</label>
                    </div>
                </div>
                <div className="input_box">
                    <input type="email" id="signup-email" className="input-field" name="email" required onChange={onInputChange} />
                    <label htmlFor="signup-email" className="label">Email Address</label>
                    <i className="bx bx-envelope icon"></i>
                </div>
                <div className="input_box">
                    <input type="tel" id="signup-mobile" className="input-field" name="mobile" required onChange={onInputChange} />
                    <label htmlFor="signup-mobile" className="label">Mobile Number</label>
                    <i className='bx bx-phone icon'></i>
                </div>
                <div className="input_box">
                    <button type="submit" className="input-submit">Continue</button>
                </div>
                <div className="go-back">
                    <span>Already have an account? <a onClick={() => onSectionChange('login')}>Login</a></span>
                </div>
            </form>
        </div>
    );

    const renderCreatePasswordSection = () => (
        <div className={`form-section ${currentSection === 'password' ? 'active' : ''}`}>
            <div className="form-content">
                <h2>Create Password</h2>
                <p>Choose a strong and secure password.</p>
                <form onSubmit={onCreatePasswordSubmit}>
                    {errors.general && <p className="error-message">{errors.general}</p>}
                    <div className="input_box">
                        <input type="password" id="new-pass" className="input-field" name="newPassword" required onChange={onInputChange} />
                        <label htmlFor="new-pass" className="label">New Password</label>
                        <i className="bx bx-lock-alt icon"></i>
                    </div>
                    <div className="input_box">
                        <input type="password" id="confirm-pass" className="input-field" name="confirmPassword" required onChange={onInputChange} />
                        <label htmlFor="confirm-pass" className="label">Confirm Password</label>
                        <i className="bx bx-lock-alt icon"></i>
                    </div>
                    {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
                    <div className="input_box">
                        <button type="submit" className="input-submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create & Login'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderForgotPasswordSection = () => (
        <div className={`form-section ${currentSection === 'forgot-password' ? 'active' : ''}`}>
            <div className="form-content">
                <h2>Forgot Password</h2>
                <p>Enter your email to receive a reset link.</p>
                <form onSubmit={onForgotPasswordSubmit}>
                    {errors.general && <p className="error-message">{errors.general}</p>}
                    <div className="input_box">
                        <input type="email" id="forgot-email" className="input-field" name="email" required onChange={onInputChange} />
                        <label htmlFor="forgot-email" className="label">Email Address</label>
                        <i className="bx bx-envelope icon"></i>
                    </div>
                    <div className="input_box">
                        <button type="submit" className="input-submit" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send Link'}
                        </button>
                    </div>
                    <div className="go-back">
                        <span>Remembered your password? <a onClick={() => onSectionChange('login')}>Login</a></span>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderLinkSentSection = () => (
        <div className={`form-section ${currentSection === 'link-sent' ? 'active' : ''}`}>
            <div className="confirmation-content">
                <i className='bx bx-check-circle checkmark'></i>
                <h2>Link Sent!</h2>
                <p>A password reset link has been sent to your email address.</p>
            </div>
        </div>
    );

    switch (currentSection) {
        case 'login':
            return renderLoginSection();
        case 'signup':
            return renderSignUpSection();
        case 'password':
            return renderCreatePasswordSection();
        case 'forgot-password':
            return renderForgotPasswordSection();
        case 'link-sent':
            return renderLinkSentSection();
        default:
            return renderLoginSection();
    }
};

export default AuthComp;