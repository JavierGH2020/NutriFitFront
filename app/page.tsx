import Link from "next/link"
import { ArrowRight, Utensils, Dumbbell, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative">
        <div className="container flex flex-col items-center justify-center gap-4 py-12 text-center md:py-24">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Transforma tu cuerpo, transforma tu vida
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            FitTrack te ayuda a registrar tus comidas, seguir tus entrenamientos y monitorear tu progreso para alcanzar
            tus metas fitness.
          </p>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Button size="lg" asChild>
              <Link href="/alimentos">Comenzar ahora</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/calculadora-imc">Calcular IMC</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-12 md:py-24">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Utensils className="h-10 w-10 text-primary" />
              <CardTitle className="mt-4">Registro de Alimentos</CardTitle>
              <CardDescription>
                Registra tus comidas diarias y lleva un control de tus calorías y macronutrientes.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/alimentos" className="flex items-center justify-center gap-2">
                  Explorar <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <Dumbbell className="h-10 w-10 text-primary" />
              <CardTitle className="mt-4">Registro de Entrenos</CardTitle>
              <CardDescription>
                Guarda tus rutinas de ejercicio, series, repeticiones y peso para ver tu progreso.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/entrenos" className="flex items-center justify-center gap-2">
                  Explorar <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <Calculator className="h-10 w-10 text-primary" />
              <CardTitle className="mt-4">Calculadora IMC</CardTitle>
              <CardDescription>
                Calcula tu Índice de Masa Corporal y recibe recomendaciones personalizadas.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/calculadora" className="flex items-center justify-center gap-2">
                  Calcular <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-muted py-12 md:py-24">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-4xl">
            Lo que dicen nuestros usuarios
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4 italic">
                  "FitTrack me ha ayudado a mantener un registro de mis comidas y entrenamientos. He perdido 10kg en 3
                  meses."
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary" />
                  <div>
                    <p className="font-medium">María García</p>
                    <p className="text-sm text-muted-foreground">Miembro desde 2022</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4 italic">
                  "La calculadora de IMC me dio una visión clara de mi estado físico actual y qué necesito mejorar."
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary" />
                  <div>
                    <p className="font-medium">Carlos Rodríguez</p>
                    <p className="text-sm text-muted-foreground">Miembro desde 2023</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4 italic">
                  "Gracias a FitTrack he podido organizar mis rutinas de entrenamiento y ver mi progreso semana a
                  semana."
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary" />
                  <div>
                    <p className="font-medium">Laura Martínez</p>
                    <p className="text-sm text-muted-foreground">Miembro desde 2021</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

