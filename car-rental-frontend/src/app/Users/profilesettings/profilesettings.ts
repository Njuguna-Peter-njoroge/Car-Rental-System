import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profilesettings.html',
  styleUrls: ['./profilesettings.css']
})
export class UserProfileComponent implements OnInit {
  user: any = {};
  selectedImage: File | null = null;
  imageUrl: string = '';
  loading: boolean = false;
  uploading: boolean = false;

  showResetPassword = false;
  resetting = false;
  reset = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  resetError = '';
  resetSuccess = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.fetchUserData();
  }

  fetchUserData() {
    this.loading = true;
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.get('http://localhost:3000/auth/me', { headers }).subscribe({
      next: (data: any) => {
        this.user = data;
        this.imageUrl = data.profileImage || '';
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching user:', err);
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name, file.size, file.type);
      this.selectedImage = file;
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;
        console.log('Preview created for:', file.name);
      };
      reader.readAsDataURL(file);
    }
  }

  uploadImage(): void {
    if (!this.selectedImage) {
      alert('Please select an image first.');
      return;
    }

    console.log('Starting upload for:', this.selectedImage.name);
    this.uploading = true;
    const formData = new FormData();
    formData.append('file', this.selectedImage);

    this.http.post<{ success: boolean, url: string, data: { secure_url: string } }>('http://localhost:3000/upload', formData).subscribe({
      next: (res) => {
        console.log('Upload response:', res);
        
        if (res.success && (res.url || res.data?.secure_url)) {
          // Use the correct URL field
          const imageUrl = res.url || res.data?.secure_url;
          console.log('Image uploaded successfully. URL:', imageUrl);
          this.imageUrl = imageUrl;

          // Update user's profile image in backend
          const token = this.authService.getToken();
          if (!token) {
            alert('Please login first to update your profile.');
            this.uploading = false;
            return;
          }

          const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
          
          this.http.patch('http://localhost:3000/users/profile', {
            profileImage: imageUrl
          }, { headers }).subscribe({
            next: (profileRes) => {
              console.log('Profile updated successfully:', profileRes);
              alert('Profile updated successfully!');
              this.user.profileImage = imageUrl;
              this.uploading = false;
            },
            error: (err) => {
              console.error('Error updating user profile:', err);
              alert('Image uploaded but failed to update profile. Please try again.');
              this.uploading = false;
            }
          });
        } else {
          console.error('Upload failed - invalid response:', res);
          alert('Upload failed. Please try again.');
          this.uploading = false;
        }
      },
      error: (err) => {
        console.error('Error uploading image:', err);
        alert('Upload failed. Please try again.');
        this.uploading = false;
      }
    });
  }

  resetPassword(): void {
    this.resetError = '';
    this.resetSuccess = '';
    if (!this.reset.currentPassword || !this.reset.newPassword || !this.reset.confirmPassword) {
      this.resetError = 'All fields are required.';
      return;
    }
    if (this.reset.newPassword !== this.reset.confirmPassword) {
      this.resetError = 'New passwords do not match.';
      return;
    }
    this.resetting = true;
    
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.post('http://localhost:3000/auth/reset-password', {
      token: this.reset.currentPassword,
      newPassword: this.reset.newPassword
    }, { headers }).subscribe({
      next: () => {
        this.resetSuccess = 'Password updated successfully!';
        this.reset = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.resetting = false;
        setTimeout(() => {
          this.showResetPassword = false;
          this.resetSuccess = '';
        }, 2000);
      },
      error: (err) => {
        this.resetError = err.error?.message || 'Failed to update password.';
        this.resetting = false;
      }
    });
  }
}
