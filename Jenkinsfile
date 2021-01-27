@Library('pipeline') _

def version = '21.1100'

node ('controls') {
    checkout_pipeline("21.1100/kua/add_router_tests")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('types', version)
}
