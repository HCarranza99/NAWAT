import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-svh flex flex-col items-center justify-center gap-4 px-6 py-8 text-center bg-background">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-[1.4rem] font-bold text-foreground">Algo salió mal</h2>
          <p className="text-[0.95rem] text-muted-foreground max-w-[280px]">Ocurrió un error inesperado en la aplicación.</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Recargar app
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
