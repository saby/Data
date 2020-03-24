@Library('pipeline') _

def version = '20.2000'

node ('controls') {
    checkout_pipeline("20.3000/feature/change_junit_to_junitresultarchiver_squash")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('types', version)
}