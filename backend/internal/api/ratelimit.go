package api

import (
	"net/http"
	"sync"

	"golang.org/x/time/rate"
)

type ipLimiter struct {
	mu       sync.Mutex
	limiters map[string]*rate.Limiter
	rps      rate.Limit
	burst    int
}

func newIPLimiter(rps float64, burst int) *ipLimiter {
	return &ipLimiter{
		limiters: make(map[string]*rate.Limiter),
		rps:      rate.Limit(rps),
		burst:    burst,
	}
}

func (l *ipLimiter) get(ip string) *rate.Limiter {
	l.mu.Lock()
	defer l.mu.Unlock()
	lim, ok := l.limiters[ip]
	if !ok {
		lim = rate.NewLimiter(l.rps, l.burst)
		l.limiters[ip] = lim
	}
	return lim
}

func rateLimitMiddleware(rps float64, burst int) func(http.Handler) http.Handler {
	lim := newIPLimiter(rps, burst)
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := r.RemoteAddr
			if fwd := r.Header.Get("X-Forwarded-For"); fwd != "" {
				ip = fwd
			}
			if !lim.get(ip).Allow() {
				writeError(w, http.StatusTooManyRequests, "too many requests")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
