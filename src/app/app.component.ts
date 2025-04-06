import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PostComponent } from './components/post/post.component';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { PostService, Post } from './services/post.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PostComponent, NgFor, AsyncPipe, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'angular-project';
  posts$!: Observable<Post[]>;
  error: string | null = null;
  isLoading = true;

  private destroy$ = new Subject<void>();

  constructor(private postService: PostService) {}

  ngOnInit() {
    this.loadPosts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPosts() {
    this.isLoading = true;
    this.error = null;
    this.posts$ = this.postService.getPosts();
    
    this.posts$.pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading = false)
    ).subscribe({
      error: (err) => {
        this.error = err.message;
        this.isLoading = false;
      }
    });
  }
  
  refreshPosts() {
    this.isLoading = true;
    this.postService.refreshPosts();
    this.loadPosts();
  }
}
