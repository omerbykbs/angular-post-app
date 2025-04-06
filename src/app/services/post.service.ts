import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Post {
  id?: number;
  name: string;
  img: string;
  text: string;
  time: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = `${environment.apiUrl}/posts`;
  private postsCache$: Observable<Post[]> | null = null;
  private refreshPosts$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { }

  getPosts(): Observable<Post[]> {
    if (!this.postsCache$ || this.refreshPosts$.value) {
        this.refreshPosts$.next(false);
        this.postsCache$ = this.http.get<Post[]>(this.apiUrl).pipe(
          tap(posts => console.log('Fetched posts:', posts.length)),
          catchError(this.handleError),
          shareReplay(1)
        );
    }
    return this.postsCache$;
  }

  refreshPosts() {
    this.refreshPosts$.next(true);
    return this.getPosts();
  }

  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createPost(post: Post): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, post).pipe(
      tap(() => this.refreshPosts$.next(true)),
      catchError(this.handleError)
    );
  }

  updatePost(id: number, post: Post): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${id}`, post).pipe(
      tap(() => this.refreshPosts$.next(true)),
      catchError(this.handleError)
    );
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshPosts$.next(true)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Something went wrong. Please try again later.';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`;
      console.error(errorMessage);
    } else {
      errorMessage = `Server error: ${error.status}, message: ${error.message}`;
      console.error(errorMessage, error.error);
    }
    
    return throwError(() => new Error(errorMessage));
  }
}